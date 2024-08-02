import { Test } from '@nestjs/testing';
import { EventsQueue, EventsWorker, EventData, Log } from './events.worker';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Network, NetworksService } from '~/core/networks/networks.service';
import { BullModule } from '@nestjs/bullmq';
import { DEFAULT_REDIS_NAMESPACE, getRedisToken } from '@songkeys/nestjs-redis';
import { DeepPartial, randomAddress } from '~/util/test';
import { ACCOUNT_ABI, Address } from 'lib';
import { encodeEventTopics } from 'viem';
import { QueueData, TypedJob, TypedQueue } from '~/core/bull/bull.util';
import { AbiEvent } from 'abitype';
import { EventsService, ProcessConfirmedParams } from './events.service';

describe(EventsWorker.name, () => {
  let worker: EventsWorker;
  let queue: DeepMocked<TypedQueue<EventsQueue>>;
  let networks: DeepMocked<NetworksService>;
  let events: DeepMocked<EventsService>;
  let attemptsMade = 0;

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

    networks = module.get(NetworksService);
    networks.get.mockReturnValue({
      blockNumber: async () => 1n,
      blockTime: () => 1,
      getLogs: async () => logs,
    } satisfies DeepPartial<Network> as unknown as Network);

    events = module.get(EventsService);
    events.processConfirmed.mockImplementation(async () => {});

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

    expect(events.processConfirmed).toHaveBeenCalledTimes(1);
    expect(events.processConfirmed).toHaveBeenCalledWith({
      chain: 'zksync-local',
      logs,
    } satisfies ProcessConfirmedParams);
  });

  it('queue before processing', async () => {
    await process({ from: 1 });

    expect(events.processConfirmed).toHaveBeenCalled();
    expect(queue.add).toHaveBeenCalledTimes(1);
    expect(queue.add.mock.invocationCallOrder[0]).toBeLessThan(
      events.processConfirmed.mock.invocationCallOrder[0],
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
      blockNumber: async () => 10n,
      blockTime: () => 1,
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
