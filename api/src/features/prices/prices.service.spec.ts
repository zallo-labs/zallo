import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js';
import { DEFAULT_REDIS_NAMESPACE, getRedisToken } from '@songkeys/nestjs-redis';

import { PricesService } from '~/features/prices/prices.service';
import { Network, NetworksService } from '~/features/util/networks/networks.service';
import { runExclusively } from '~/util/mutex';

jest.mock('~/util/mutex', () => ({
  runExclusively: jest.fn(),
}));
jest.mocked(runExclusively).mockImplementation(async (f) => f());

const getLatestPriceFeeds: jest.MockedFunction<
  typeof EvmPriceServiceConnection.prototype.getLatestPriceFeeds
> = jest.fn();
const getPriceFeedsUpdateData: jest.MockedFunction<
  typeof EvmPriceServiceConnection.prototype.getPriceFeedsUpdateData
> = jest.fn();

jest.mock('@pythnetwork/pyth-evm-js', () => ({
  ...jest.requireActual('@pythnetwork/pyth-evm-js'),
  EvmPriceServiceConnection: function () {
    return {
      getLatestPriceFeeds,
      getPriceFeedsUpdateData,
      subscribePriceFeedUpdates: jest.fn(),
    } as any as EvmPriceServiceConnection;
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

    getPriceFeedsUpdateData.mockReset();
    getPriceFeedsUpdateData.mockImplementation(async () => []);
  });

  describe('updatePriceFeedsIfNecessary', () => {
    it("update only price feeds than aren't fresh", async () => {
      service.checkPriceFeedFresh = jest.fn();
      const priceFeeds = ['0x01' as const, '0x02' as const];
      jest
        .mocked(service.checkPriceFeedFresh)
        .mockImplementation(async (_chain, priceId) => priceId !== priceFeeds[0]);

      await service.updatePriceFeedsIfNecessary('zksync-local', priceFeeds);
      expect(getPriceFeedsUpdateData).toHaveBeenCalledWith([priceFeeds[0]]);
      expect(network.useWallet).toHaveBeenCalled();
    });

    it('not update price feeds when price feeds are all fresh', async () => {
      service.checkPriceFeedFresh = jest.fn();
      jest.mocked(service.checkPriceFeedFresh).mockImplementation(async () => true);

      await service.updatePriceFeedsIfNecessary('zksync-local', ['0x']);
      expect(getPriceFeedsUpdateData).not.toHaveBeenCalled();
      expect(network.useWallet).not.toHaveBeenCalled();
    });
  });
});
