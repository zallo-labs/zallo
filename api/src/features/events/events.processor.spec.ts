import { Test } from '@nestjs/testing';
import { EventsProcessor } from './events.processor';
import { createMock } from '@golevelup/ts-jest';

describe(EventsProcessor.name, () => {
  let processor: EventsProcessor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [EventsProcessor],
    })
      .useMocker(createMock)
      .compile();

    processor = module.get(EventsProcessor);
  });

  it.todo('test me!');
});
