import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private db: PrismaService,
    private jwt: JwtService,
  ) {}

  async OAuthGoogleCallback(user: any): Promise<string> {
    const findUser = await this.db.prisma.users.findFirst({
      where: { email: user.email },
      include: { OAuthAccount: true },
    });

    if (!findUser) {
      const newUser = await this.db.prisma.users.create({
        data: {
          email: user.email,
          firstName: user.given_name || '',
          lastName: user.family_name || '',
          username: user.name || user.email.split('@')[0],
          password: await bcrypt.hash(Math.random().toString(36).slice(-8), 12),
        },
      });

      await this.db.prisma.oAuthAccount.create({
        data: {
          provider: 'Google',
          providerId: user.sub,
          userId: newUser.id,
        },
      });

      const token = await this.jwt.signAsync({ userId: newUser.id });
      return token;
    }

    const findAccount = findUser.OAuthAccount.find(
      (account) => account.provider === 'Google',
    );

    if (!findAccount) {
      await this.db.prisma.oAuthAccount.create({
        data: {
          provider: 'Google',
          providerId: user.sub,
          userId: findUser.id,
        },
      });
    }

    const token = await this.jwt.signAsync({ userId: findUser.id });
    return token;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
  }): Promise<string> {
    const findUser = await this.db.prisma.users.findFirst({
      where: {
        email: data.email,
      },
    });

    if (findUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.db.prisma.users.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    const token = await this.jwt.signAsync({
      userId: user.id,
    });

    return token;
  }

  async login(data: { email: string; password: string }): Promise<string> {
    const find_user = await this.db.prisma.users.findFirst({
      where: {
        email: data.email,
      },
    });

    if (!find_user) {
      throw new BadRequestException('User not found!');
    }

    if (!find_user?.password) {
      throw new BadRequestException('password not set');
    }

    const comparePassword = await bcrypt.compare(
      data.password,
      find_user.password,
    );

    if (!comparePassword) {
      throw new BadRequestException('Email or Password incorrect');
    }

    const token = await this.jwt.signAsync({
      userId: find_user.id,
    });

    return token;
  }
}
