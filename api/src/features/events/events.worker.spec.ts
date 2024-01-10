import { Test } from '@nestjs/testing';
import { EventsQueue, EventsWorker, EventData, Log } from './events.worker';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Network, NetworksService } from '../util/networks/networks.service';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { DEFAULT_REDIS_NAMESPACE, getRedisToken } from '@songkeys/nestjs-redis';
import { DeepPartial, randomAddress } from '~/util/test';
import { ACCOUNT_IMPLEMENTATION, Address } from 'lib';
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
        abi: ACCOUNT_IMPLEMENTATION.abi,
        eventName: 'Upgraded',
        args: { implementation: randomAddress() },
      }) as [Address, ...Address[]],
    } satisfies Partial<Log<AbiEvent>> as Log<AbiEvent>,
    {
      logIndex: 1,
      topics: encodeEventTopics({
        abi: ACCOUNT_IMPLEMENTATION.abi,
        eventName: 'Upgraded',
        args: { implementation: randomAddress() },
      }) as [Address, ...Address[]],
    } satisfies Partial<Log<AbiEvent>> as Log<AbiEvent>,
    {
      logIndex: 2,
      topics: encodeEventTopics({
        abi: ACCOUNT_IMPLEMENTATION.abi,
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
      .overrideProvider(getQueueToken(EventsQueue.name))
      .useValue(createMock())
      .useMocker(createMock)
      .compile();

    worker = module.get(EventsWorker);
    topic1Listener = jest.fn();
    worker.on(getAbiItem({ abi: ACCOUNT_IMPLEMENTATION.abi, name: 'Upgraded' }), topic1Listener);

    networks = module.get(NetworksService);
    networks.get.mockReturnValue({
      blockNumber: () => 1n,
      getLogs: async () => logs,
    } satisfies DeepPartial<Network> as unknown as Network);

    queue = module.get(getQueueToken(EventsQueue.name));

    attemptsMade = 1;
  });

  const process = (data: Omit<QueueData<EventsQueue>, 'chain'>) =>
    worker.process({
      data: { ...data, chain: 'zksync-local' },
      attemptsMade: attemptsMade++,
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
