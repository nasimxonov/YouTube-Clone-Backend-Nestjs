import { Module } from '@nestjs/common';
import { SeederService } from './seeders.service';

@Module({
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}