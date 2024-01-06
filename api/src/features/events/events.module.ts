import { Module } from '@nestjs/common';

import { registerBullQueue } from '../util/bull/bull.util';
import { EventsQueue, EventsWorker } from './events.worker';

@Module({
  imports: [...registerBullQueue(EventsQueue)],
  exports: [EventsWorker],
  providers: [EventsWorker],
})
export class EventsModule {}
