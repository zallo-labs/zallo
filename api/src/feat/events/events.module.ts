import { Module } from '@nestjs/common';
import { EventsQueue, EventsWorker } from './events.worker';
import { registerBullQueue } from '~/core/bull/bull.util';
import { EventsService } from './events.service';

@Module({
  imports: [...registerBullQueue(EventsQueue)],
  exports: [EventsService, EventsWorker],
  providers: [EventsService, EventsWorker],
})
export class EventsModule {}
