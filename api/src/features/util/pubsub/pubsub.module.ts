import { Module } from '@nestjs/common';
import { PubsubService } from './pubsub.service';

@Module({
  exports: [PubsubService],
  providers: [PubsubService],
})
export class PubsubModule {}
