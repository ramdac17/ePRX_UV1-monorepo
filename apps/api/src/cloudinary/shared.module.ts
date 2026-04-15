import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [CloudinaryModule],
  exports: [CloudinaryModule],
})
export class SharedModule {}
