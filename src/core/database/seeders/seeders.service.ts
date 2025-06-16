import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import PrismaService from '../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async seedAll() {
    await this.seedUsers();
  }

  async seedUsers() {
    const username = this.configService.get('SUPERADMIN_USERNAME');
    const email = this.configService.get('SUPERADMIN_EMAIL');
    const password = this.configService.get('SUPERADMIN_PASSWORD');
    const firstName = this.configService.get('SUPERADMIN_FIRSTNAME') || 'Super';
    const lastName = this.configService.get('SUPERADMIN_LASTNAME') || 'Admin';
    const passwordHash = await bcrypt.hash(password, 10);

    const findExistsAdmin = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!findExistsAdmin) {
      await this.prisma.user.create({
        data: {
          username,
          email,
          password: passwordHash,
          role: Role.SUPERADMIN,
          firstName,
          lastName,
        },
      });
    }
  }

  async onModuleInit() {
    try {
      await this.seedAll();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
