import { Visibility } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNumber()
  @Type(() => Number)
  duration: number;

  @IsOptional()
  @IsEnum(Visibility)
  visibility: Visibility;
}


