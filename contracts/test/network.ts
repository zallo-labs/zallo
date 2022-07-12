import { expect, wallet, provider } from './util';

describe('Network', function () {
  it('Can fetch wallet balance', async () => {
    const balance = await wallet.getBalance();
    expect(balance.gte(0)).to.be.true;
  });

  it('Can fetch block number', async () => {
    const blockNumber = await provider.getBlockNumber();
    expect(blockNumber).to.be.greaterThanOrEqual(0);
  });
});
