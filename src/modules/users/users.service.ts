import { Injectable, NotFoundException } from '@nestjs/common';
import {PrismaService} from 'src/core/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async updateUser(id: string, data: any) {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
