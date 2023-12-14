import { Module } from '@nestjs/common';
import { EventsQueue, EventsWorker } from './events.worker';
import { registerBullQueue } from '../util/bull/bull.util';

@Module({
  imports: [...registerBullQueue(EventsQueue)],
  exports: [EventsWorker],
  providers: [EventsWorker],
})
export class EventsModule {}
