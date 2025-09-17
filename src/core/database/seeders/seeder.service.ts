import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async seedAll() {
    await this.seedUsers();
  }
  async seedUsers() {
    this.logger.log('Users seeders started');

    const email = this.configService.get('SP_EMAIL');
    const username = this.configService.get('SP_USERNAME');
    const password = this.configService.get('SP_PASSWORD');

    const findExistsAdmin = await this.db.prisma.users.findFirst({
      where: { username },
    });

    if (!findExistsAdmin) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await this.db.prisma.users.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role: 'SUPERADMIN',
          is_email_verified: true,
        },
      });
      this.logger.log('Users seeders ended');
    } else {
      this.logger.warn('Superadmin already existed');
    }
  }
  async onModuleInit() {
    try {
      await this.seedAll();
      this.logger.log('Seeder ishladi');
    } catch (error) {
      this.logger.error(error);
    }
  }
}
