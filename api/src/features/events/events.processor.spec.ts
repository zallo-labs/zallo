import { Test, TestingModule } from '@nestjs/testing';
import { EVENTS_QUEUE, EventsProcessor, EventData } from './events.processor';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ProviderService } from '../util/provider/provider.service';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Log } from 'zksync-web3/build/src/types';

describe(EventsProcessor.name, () => {
  let processor: EventsProcessor;
  let queue: DeepMocked<Queue<EventData>>;
  let provider: DeepMocked<ProviderService>;
  let attemptsMade = 0;

  let topic1Listener: jest.Mock;
  const logs = [
    { logIndex: 0, topics: ['topic 1'] },
    { logIndex: 1, topics: ['topic 1'] },
    { logIndex: 2, topics: ['topic 2'] },
  ] as Log[];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [BullModule.registerQueue(EVENTS_QUEUE)],
      providers: [EventsProcessor],
    })
      .overrideProvider(getQueueToken(EVENTS_QUEUE.name))
      .useValue(createMock())
      .useMocker(createMock)
      .compile();

    processor = module.get(EventsProcessor);
    topic1Listener = jest.fn();
    processor.on('topic 1', topic1Listener);

    provider = module.get(ProviderService);
    provider.getLogs.mockReturnValue((async () => logs)());
    provider.getBlockNumber.mockReturnValue((async () => 1)());

    queue = module.get(getQueueToken(EVENTS_QUEUE.name));

    attemptsMade = 0;
  });

  const process = (data: EventData) =>
    processor.process({ data, attemptsMade: attemptsMade++ } as Job<EventData>);

  it('send relevant event to listeners', async () => {
    await process({ from: 1 });

    expect(topic1Listener).toHaveBeenCalledTimes(2);
    expect(topic1Listener).toHaveBeenCalledWith({ log: logs[0] });
    expect(topic1Listener).toHaveBeenCalledWith({ log: logs[1] });
  });

  it('queue before processing', async () => {
    await process({ from: 1 });

    expect(topic1Listener).toHaveBeenCalled();
    expect(queue.add).toHaveBeenCalledTimes(1);
    expect(queue.add.mock.invocationCallOrder[0]).toBeLessThan(
      topic1Listener.mock.invocationCallOrder[0],
    );
  });

  it('queue on the first attempt', async () => {
    await process({ from: 1 });
    expect(queue.add).toHaveBeenCalledTimes(1);
  });

  it('not queue on subsequent attempts', async () => {
    await process({ from: 1 });
    await process({ from: 1 });
    expect(queue.add).toHaveBeenCalledTimes(1);
  });

  it('split into 2 jobs if too many results', async () => {
    provider.getBlockNumber.mockReturnValue((async () => 10)());
    provider.getLogs.mockImplementation(async () => {
      throw new Error(
        'Query returned more than 10000 results. Try with this block range [0x01, 0x03]',
      );
    });

    queue.addBulk.mockImplementation(async (jobs) => {
      expect(jobs).toHaveLength(2);
      expect(jobs[0].data.from).toEqual(1);
      expect(jobs[0].data.to).toEqual(3);
      expect(jobs[1].data.from).toEqual(4);
      expect(jobs[1].data.to).toEqual(10);
      return [];
    });

    await process({ from: 1, to: 10 });

    expect(queue.addBulk).toHaveBeenCalledTimes(1);
  });
});
