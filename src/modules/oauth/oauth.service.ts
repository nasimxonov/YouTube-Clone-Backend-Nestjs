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
      include: { OAuthAccount: true },
    });
    if (!findUSer) {
      const newUser = await this.db.prisma.users.create({
        data: {
          email: user.email,
          username: user.fullName,
          isBlocked: true,
        },
      });
      await this.db.prisma.oAuthAccount.create({
        data: {
          provider: 'Google',
          providerId: user.googleId,
          userId: newUser.id,
        },
      });
      const token = await this.jwt.signAsync({ userId: newUser.id });
      return { token };
    }
    const findAccount = findUSer.OAuthAccount.find(
      (account) => account.provider === 'Google',
    );
    if (!findAccount) {
      await this.db.prisma.oAuthAccount.create({
        data: {
          provider: 'Google',
          providerId: user.googleId,
          userId: findUSer.id,
        },
      });
    }
    const token = await this.jwt.signAsync({ userId: findUSer.id });
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
    console.log('nasimxonovS');
    return findUSer;
  }
}
