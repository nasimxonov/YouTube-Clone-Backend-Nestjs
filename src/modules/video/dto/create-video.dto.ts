import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVideoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
