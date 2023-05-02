import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EVENTS_QUEUE, EventsProcessor } from './events.processor';

@Module({
  imports: [BullModule.registerQueue(EVENTS_QUEUE)],
  exports: [EventsProcessor],
  providers: [EventsProcessor],
})
export class EventsModule {}
