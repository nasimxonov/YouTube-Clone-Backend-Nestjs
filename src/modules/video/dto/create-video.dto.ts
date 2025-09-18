import { Visibility } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateVideoDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsUUID()
  categoryId?: string;

  @IsNumber()
  @Type(() => Number)
  duration: number;

  @IsOptional()
  @IsEnum(Visibility)
  visibility: Visibility;
}
