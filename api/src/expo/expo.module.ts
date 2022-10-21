import { Module } from '@nestjs/common';
import { ExpoService } from './expo.service';

@Module({
  exports: [ExpoService],
  providers: [ExpoService],
})
export class ExpoModule {}
