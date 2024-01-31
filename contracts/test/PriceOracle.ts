import { Address, ETH_ADDRESS, Hex } from 'lib';
import { deploy, network, wallet } from './util';
import MockPyth from './contracts/MockPyth';
import TestPriceOracle from './contracts/TestPriceOracle';
import { ETH, DAI, USDC, WETH, RETH, CBETH } from 'lib/dapps';
import { CONFIG } from '../config';
import { zeroAddress } from 'viem';
import { expect } from 'chai';

const chain = CONFIG.chain.key;
const disabled = zeroAddress;

describe('PriceOracle', () => {
  let prices: Address;
  let pyth: Address;

  before(async () => {
    pyth = (await deploy(MockPyth, [60n, 0n])).address;
    prices = (
      await deploy(TestPriceOracle, [
        {
          pyth,
          ethUsdPriceId: ETH.pythUsdPriceId,
          dai: { token: DAI.address[chain] ?? disabled, usdPriceId: DAI.pythUsdPriceId },
          usdc: { token: USDC.address[chain] ?? disabled, usdPriceId: USDC.pythUsdPriceId },
          weth: { token: WETH.address[chain] ?? disabled, usdPriceId: WETH.pythUsdPriceId },
          reth: { token: RETH.address[chain] ?? disabled, usdPriceId: RETH.pythUsdPriceId },
          cbeth: { token: CBETH.address[chain] ?? disabled, usdPriceId: CBETH.pythUsdPriceId },
        },
      ])
    ).address;
  });

  const convert = (amount: bigint, from: Address, to: Address) =>
    network.readContract({
      address: prices,
      abi: TestPriceOracle.abi,
      functionName: 'convert',
      args: [amount, from, to],
    });

  describe('convert', () => {
    it('convert from one token to another', async () => {
      await updatePriceFeeds(pyth, [
        { feed: ETH.pythUsdPriceId, price: 2356_12n },
        { feed: USDC.pythUsdPriceId, price: 99n },
      ]);

      // 364.29 USDC -> 0.153068222331629967 ETH
      expect(
        await convert(BigInt(364.29 * 10 ** USDC.decimals), USDC.address[chain], ETH_ADDRESS),
      ).to.eq(153068222331629967n);
    });

    it('return the same amount if the from and to token are the same', async () => {
      const amount = 123n;
      expect(await convert(amount, ETH_ADDRESS, ETH_ADDRESS)).to.eq(amount);
    });

    it('revert if the from token is unsupported', async () => {
      await expect(
        convert(1n, '0x000000000000000000000000000000000000000f', ETH_ADDRESS),
      ).to.revertWith({
        abi: TestPriceOracle.abi,
        errorName: 'UnsupportedToken',
      });
    });

    it('revert if the to token is unsupported', async () => {
      await expect(
        convert(1n, ETH_ADDRESS, '0x000000000000000000000000000000000000000f'),
      ).to.revertWith({
        abi: TestPriceOracle.abi,
        errorName: 'UnsupportedToken',
      });
    });
  });
});

interface FeedUpdate {
  feed: Hex;
  price: bigint;
}

async function updatePriceFeeds(pyth: Address, updates: FeedUpdate[]) {
  const timestamp = (await network.getBlock()).timestamp;
  const r = await wallet.writeContract({
    address: pyth,
    abi: MockPyth.abi,
    functionName: 'updatePriceFeeds',
    args: [
      await Promise.all(
        updates.map(({ feed, price }) =>
          network.readContract({
            address: pyth,
            abi: MockPyth.abi,
            functionName: 'createPriceFeedUpdateData',
            args: [feed, price, 1n, -2, price, 1n, timestamp, timestamp - 1n],
          }),
        ),
      ),
    ],
  });

  await network.waitForTransactionReceipt({ hash: r });
}
