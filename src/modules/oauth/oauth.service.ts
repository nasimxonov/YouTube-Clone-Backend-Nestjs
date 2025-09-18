import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class OAuthService {
  constructor(
    private db: PrismaService,
    private jwt: JwtService,
  ) {}

  async oauthGoogleCallback(user: any) {
    const findUSer = await this.db.prisma.users.findFirst({
      where: { email: user.email },
    });
    if (!findUSer) {
      const newUser = await this.db.prisma.users.create({
        data: {
          email: user.email,
          username: user.fullName,
        },
      });
      const token = await this.jwt.signAsync({
        id: newUser.id,
        role: newUser.role,
      });
      return { token };
    }
    const token = await this.jwt.signAsync({
      id: findUSer.id,
      role: findUSer.role,
    });
    return { token };
  }

  async getMe(userId: string) {
    console.log(userId);
    const findUSer = await this.db.prisma.users.findFirst({
      where: {
        id: userId,
      },
      include: {
        _count: {
          select: {
            subscribers: true,
            subscriptions: true,
          },
        },
      },
    });
    if (!findUSer) throw new NotFoundException('User not found');
    console.log("nasimxonovS");
    return findUSer;
  }
}
