import { Global, Module } from '@nestjs/common';

import { PubsubService } from './pubsub.service';

@Global()
@Module({
  exports: [PubsubService],
  providers: [PubsubService],
})
export class PubsubModule {}
