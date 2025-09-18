import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private db: PrismaService) {}

  async create(title: string) {
    try {
      return await this.db.prisma.category.create({
        data: { title },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {
    try {
      return await this.db.prisma.category.findMany();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.db.prisma.category.findUnique({
        where: { id },
        include: { videos: true },
      });

      if (!category) {
        throw new NotFoundException('Category topilmadi');
      }
      return category;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, title?: string) {
    try {
      return await this.db.prisma.category.update({
        where: { id },
        data: { title },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.db.prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
