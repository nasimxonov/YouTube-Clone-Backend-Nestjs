import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';
import bcrypt from 'bcrypt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login.auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private db: PrismaService,
  ) {}

  async register(data: RegisterAuthDto) {
    const findEmail = await this.db.prisma.users.findFirst({
      where: { email: data.email },
    });
    if (findEmail) throw new ConflictException('this email already existed!');
    const findUsername = await this.db.prisma.users.findFirst({
      where: { username: data.username },
    });

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const { password, ...newUser } = await this.db.prisma.users.create({
      data: { ...data, password: hashedPassword },
    });
    const token = this.jwtService.sign({ userId: newUser.id });
    return { message: 'user succesfully created', data: newUser, token };
  }

  async loginWithPassword(data: LoginAuthDto) {
    const findUser = await this.db.prisma.users.findFirst({
      where: { email: data.email },
    });

    if (!findUser) throw new NotFoundException('User not found');

    const comparePassword = await bcrypt.compare(
      data.password,
      findUser.password,
    );

    if (!comparePassword) throw new NotFoundException('Password incorrect');

    const token = this.jwtService.sign({ userId: findUser.id });
    return token;
  }
}
