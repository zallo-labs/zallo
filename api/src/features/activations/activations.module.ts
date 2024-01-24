import { Module } from '@nestjs/common';
import { registerBullQueue } from '../util/bull/bull.util';
import { ActivationsWorker } from './activations.worker';
import { ActivationsQueue } from './activations.queue';
import { ActivationsService } from './activations.service';

@Module({
  imports: [...registerBullQueue(ActivationsQueue)],
  exports: [ActivationsService],
  providers: [ActivationsService, ActivationsWorker],
})
export class ActivationsModule {}
