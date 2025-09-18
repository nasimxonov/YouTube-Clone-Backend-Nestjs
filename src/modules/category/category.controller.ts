import {
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Controller,
  SetMetadata,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@SetMetadata('isFreeAuth', true)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('add')
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto.title);
  }

  @Get('all')
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto.title);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
