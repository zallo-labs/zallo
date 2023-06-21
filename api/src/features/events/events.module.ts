import { Module } from '@nestjs/common';
import { EVENTS_QUEUE, EventsProcessor } from './events.processor';
import { registerBullQueue } from '../util/bull/bull.util';

@Module({
  imports: [...registerBullQueue(EVENTS_QUEUE)],
  exports: [EventsProcessor],
  providers: [EventsProcessor],
})
export class EventsModule {}
