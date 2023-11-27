import { Test } from '@nestjs/testing';
import { EVENTS_QUEUE, EventsProcessor, EventJobData } from './events.processor';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Network, NetworksService } from '../util/networks/networks.service';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Log } from 'zksync-web3/build/src/types';
import { DEFAULT_REDIS_NAMESPACE, getRedisToken } from '@songkeys/nestjs-redis';
import { DeepPartial } from '~/util/test';
import { ACCOUNT_IMPLEMENTATION } from 'lib';
import { getAbiItem } from 'viem';

describe(EventsProcessor.name, () => {
  let processor: EventsProcessor;
  let queue: DeepMocked<Queue<EventJobData>>;
  let networks: DeepMocked<NetworksService>;
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
      providers: [
        EventsProcessor,
        { provide: getRedisToken(DEFAULT_REDIS_NAMESPACE), useValue: createMock() },
      ],
    })
      .overrideProvider(getQueueToken(EVENTS_QUEUE.name))
      .useValue(createMock())
      .useMocker(createMock)
      .compile();

    processor = module.get(EventsProcessor);
    topic1Listener = jest.fn();
    processor.on(getAbiItem({ abi: ACCOUNT_IMPLEMENTATION.abi, name: 'Upgraded' }), topic1Listener);

    networks = module.get(NetworksService);
    networks.get.mockReturnValue({
      getBlockNumber: async () => 1n,
      getLogs: async () => logs,
    } satisfies DeepPartial<Network> as unknown as Network);

    queue = module.get(getQueueToken(EVENTS_QUEUE.name));

    attemptsMade = 0;
  });

  const process = (data: Omit<EventJobData, 'chain'>) =>
    processor.process({
      data: { ...data, chain: 'zksync-local' },
      attemptsMade: attemptsMade++,
    } as Job<EventJobData>);

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
    networks.get.mockReturnValue({
      getBlockNumber: async () => 10n,
      getLogs: async () => {
        throw new Error(
          'Query returned more than 10000 results. Try with this block range [0x01, 0x03]',
        );
      },
    } satisfies DeepPartial<Network> as unknown as Network);

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
