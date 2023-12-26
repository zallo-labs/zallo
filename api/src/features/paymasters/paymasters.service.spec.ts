import { Test } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PaymastersService } from '~/features/paymasters/paymasters.service';
import { DatabaseService } from '~/features/database/database.service';
import { PricesService } from '~/features/prices/prices.service';
import { TokensService } from '~/features/tokens/tokens.service';
import { Network, NetworksService } from '~/features/util/networks/networks.service';
import { randomLabel, randomUAddress } from '~/util/test';
import e from '~/edgeql-js';
import { asAddress, asUAddress, ETH_ADDRESS, randomDeploySalt } from 'lib';
import Decimal from 'decimal.js';
import { selectAccount } from '~/features/accounts/accounts.util';
import { USDC } from 'lib/dapps';
import { FeesPerGas } from '~/features/paymasters/paymasters.model';

jest.mock('lib', () => ({
  ...jest.requireActual('lib'),
  encodePaymasterInput: jest.fn(),
}));

describe(PaymastersService.name, () => {
  let service: PaymastersService;
  let db: DatabaseService;
  let networks: DeepMocked<NetworksService>;
  let network: DeepMocked<Network>;
  let prices: DeepMocked<PricesService>;
  let tokens: DeepMocked<TokensService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PaymastersService, DatabaseService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(PaymastersService);
    db = module.get(DatabaseService);
    networks = module.get(NetworksService);
    prices = module.get(PricesService);
    tokens = module.get(TokensService);

    network = createMock<Network>();
    networks.get.mockImplementation(() => network);
    network.getTransactionCount.mockImplementation(async () => 0);
    network.useWallet.mockImplementation(
      async () =>
        '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c',
    );
    network.estimateFeesPerGas.mockImplementation(async () => ({
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n,
    }));

    prices.price.mockImplementation(async () => ({
      id: '0x',
      eth: new Decimal(1),
      ethEma: new Decimal(1),
      usd: new Decimal(1),
      usdEma: new Decimal(1),
    }));
  });

  const insertAccount = async (credit?: Decimal) => {
    const address = randomUAddress();
    await db.query(
      e.insert(e.Account, {
        address,
        implementation: asAddress(address),
        isActive: false,
        label: randomLabel(),
        salt: randomDeploySalt(),
        paymasterEthCredit: credit?.toString(),
      }),
    );

    return address;
  };

  describe('currentParams', () => {
    it('uses account credit as discount', async () => {
      const credit = new Decimal(3);
      const account = await insertAccount(credit);
      const { ethDiscount } = await service.currentParams({
        account,
        gasLimit: 10000000000000000000000000000000n,
        feeToken: ETH_ADDRESS,
        paymasterEthFee: new Decimal(1),
      });
      expect(ethDiscount).toEqual(credit);

      const postCredit = await db.query(selectAccount(account).paymasterEthCredit);
      expect(postCredit).toEqual('0');
    });

    it('updates price feeds', async () => {
      const account = await insertAccount();
      await service.currentParams({
        account,
        gasLimit: 10000000000000000000000000000000n,
        feeToken: ETH_ADDRESS,
        paymasterEthFee: new Decimal(1),
      });

      expect(prices.updatePriceFeedsIfNecessary).toHaveBeenCalled();
    });
  });

  describe('estimateFeePerGas', () => {
    it('converts correctly', async () => {
      const feeToken = asUAddress(USDC.address['zksync-local'], 'zksync-local');
      prices.price.mockImplementation(async () => ({
        id: '0x',
        eth: new Decimal(0.004),
        ethEma: new Decimal(0.004),
        usd: new Decimal(0),
        usdEma: new Decimal(0),
      }));
      network.estimateFeesPerGas.mockImplementation(async () => ({
        maxFeePerGas: 125_000_000_000n,
        maxPriorityFeePerGas: 125_000_000_000n,
      }));

      expect(await service.estimateFeePerGas(feeToken)).toEqual({
        id: 'FeesPerGas:zksync-local:0x0faF6df7054946141266420b43783387A78d82A9',
        maxFeePerGas: new Decimal('0.00003125'),
        maxPriorityFeePerGas: new Decimal('0.00003125'),
        feeTokenDecimals: 6,
      } satisfies FeesPerGas);
    });
  });

  describe('estimateEthDiscount', () => {
    it('be at most account credit', async () => {
      const credit = new Decimal(5);
      const account = await insertAccount(credit);
      const discount = await service.estimateEthDiscount(
        account,
        new Decimal(100),
        new Decimal(100),
      );

      expect(discount).toEqual(credit);
    });

    it('not debit the account', async () => {
      const credit = new Decimal(5);
      const account = await insertAccount(credit);
      await service.estimateEthDiscount(account, new Decimal(100), new Decimal(100));

      const postCredit = await db.query(selectAccount(account).paymasterEthCredit);
      expect(postCredit).toEqual(credit.toString());
    });

    it('be at most maxNetworkEthFee + paymasterEthFee', async () => {
      const account = await insertAccount(new Decimal(100));
      const maxNetworkEthFee = new Decimal(1);
      const paymasterEthFee = new Decimal(2);
      const discount = await service.estimateEthDiscount(
        account,
        maxNetworkEthFee,
        paymasterEthFee,
      );

      expect(discount).toEqual(maxNetworkEthFee.plus(paymasterEthFee));
    });

    // TODO:
    // it('provide a discount if the current paymasterEthFee is lower now than when proposed', async () => {});
  });
});
