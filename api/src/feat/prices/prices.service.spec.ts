import { Test } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PricesService } from '~/feat/prices/prices.service';
import { Network, NetworksService } from '~/core/networks';
import { HermesClient } from '@pythnetwork/hermes-client';
import { runExclusively } from '~/util/mutex';
import { DEFAULT_REDIS_NAMESPACE, getRedisToken } from '@songkeys/nestjs-redis';

jest.mock('~/util/mutex', () => ({
  runExclusively: jest.fn(),
}));
jest.mocked(runExclusively).mockImplementation(async (f) => f());

const getLatestPriceUpdates: jest.MockedFunction<
  typeof HermesClient.prototype.getLatestPriceUpdates
> = jest.fn();

jest.mock('@pythnetwork/hermes-client', () => ({
  ...jest.requireActual('@pythnetwork/hermes-client'),
  HermesClient: function () {
    return { getLatestPriceUpdates } as any as HermesClient;
  },
}));

describe(PricesService.name, () => {
  let service: PricesService;
  let networks: DeepMocked<NetworksService>;
  let network: DeepMocked<Network>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PricesService,
        { provide: getRedisToken(DEFAULT_REDIS_NAMESPACE), useValue: createMock() },
      ],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(PricesService);
    networks = module.get(NetworksService);

    network = createMock<Network>();
    networks.get.mockReturnValue(network);

    getLatestPriceUpdates.mockReset();
    getLatestPriceUpdates.mockImplementation(async () => ({
      binary: { data: [] as string[], encoding: 'hex' },
    }));
  });

  describe('updatePriceFeedsIfNecessary', () => {
    it("update only price feeds than aren't fresh", async () => {
      service.checkPriceFeedFresh = jest.fn();
      const priceFeeds = ['0x01' as const, '0x02' as const];
      jest
        .mocked(service.checkPriceFeedFresh)
        .mockImplementation(async (_chain, priceId) => priceId !== priceFeeds[0]);

      await service.updatePriceFeedsIfNecessary('zksync-local', priceFeeds);
      expect(getLatestPriceUpdates).toHaveBeenCalledWith([priceFeeds[0]]);
      expect(network.useWallet).toHaveBeenCalled();
    });

    it('not update price feeds when price feeds are all fresh', async () => {
      service.checkPriceFeedFresh = jest.fn();
      jest.mocked(service.checkPriceFeedFresh).mockImplementation(async () => true);

      await service.updatePriceFeedsIfNecessary('zksync-local', ['0x']);
      expect(getLatestPriceUpdates).not.toHaveBeenCalled();
      expect(network.useWallet).not.toHaveBeenCalled();
    });
  });
});
