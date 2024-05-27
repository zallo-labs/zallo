import { Test } from '@nestjs/testing';
import { EventsQueue, EventsWorker, EventData, Log } from './events.worker';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Network, NetworksService } from '../util/networks/networks.service';
import { BullModule } from '@nestjs/bullmq';
import { DEFAULT_REDIS_NAMESPACE, getRedisToken } from '@songkeys/nestjs-redis';
import { DeepPartial, randomAddress } from '~/util/test';
import { ACCOUNT_ABI, Address } from 'lib';
import { encodeEventTopics, getAbiItem } from 'viem';
import { QueueData, TypedJob, TypedQueue } from '~/features/util/bull/bull.util';
import { AbiEvent } from 'abitype';

describe(EventsWorker.name, () => {
  let worker: EventsWorker;
  let queue: DeepMocked<TypedQueue<EventsQueue>>;
  let networks: DeepMocked<NetworksService>;
  let attemptsMade = 0;

  let topic1Listener: jest.Mock;
  const logs: Log<AbiEvent>[] = [
    {
      logIndex: 0,
      topics: encodeEventTopics({
        abi: ACCOUNT_ABI,
        eventName: 'Upgraded',
        args: { implementation: randomAddress() },
      }) as [Address, ...Address[]],
    } satisfies Partial<Log<AbiEvent>> as Log<AbiEvent>,
    {
      logIndex: 1,
      topics: encodeEventTopics({
        abi: ACCOUNT_ABI,
        eventName: 'Upgraded',
        args: { implementation: randomAddress() },
      }) as [Address, ...Address[]],
    } satisfies Partial<Log<AbiEvent>> as Log<AbiEvent>,
    {
      logIndex: 2,
      topics: encodeEventTopics({
        abi: ACCOUNT_ABI,
        eventName: 'PolicyRemoved',
      }) as [Address, ...Address[]],
    } satisfies Partial<Log<AbiEvent>> as Log<AbiEvent>,
  ];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [BullModule.registerQueue(EventsQueue)],
      providers: [
        EventsWorker,
        { provide: getRedisToken(DEFAULT_REDIS_NAMESPACE), useValue: createMock() },
      ],
    })
      .useMocker(createMock)
      .compile();

    worker = module.get(EventsWorker);
    topic1Listener = jest.fn();
    worker.on(getAbiItem({ abi: ACCOUNT_ABI, name: 'Upgraded' }), topic1Listener);

    networks = module.get(NetworksService);
    networks.get.mockReturnValue({
      blockNumber: () => 1n,
      blockTime: () => 1,
      getLogs: async () => logs,
    } satisfies DeepPartial<Network> as unknown as Network);

    queue = createMock();
    worker.queue = queue;
    queue.add.mockImplementation(async () => ({}) as any);

    attemptsMade = 0;
  });

  const process = (data: Omit<QueueData<EventsQueue>, 'chain' | 'to'> & { to?: number }) =>
    worker.process({
      data: { to: data.from + 1, ...data, chain: 'zksync-local' },
      attemptsMade: attemptsMade++,
      updateData: (async () => {}) as any,
    } as TypedJob<EventsQueue>);

  it('send relevant event to listeners', async () => {
    await process({ from: 1 });

    expect(topic1Listener).toHaveBeenCalledTimes(2);
    expect(topic1Listener).toHaveBeenCalledWith({
      log: logs[0],
      chain: 'zksync-local',
    } satisfies EventData<AbiEvent>);
    expect(topic1Listener).toHaveBeenCalledWith({
      log: logs[1],
      chain: 'zksync-local',
    } satisfies EventData<AbiEvent>);
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
      blockNumber: () => 10n,
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
