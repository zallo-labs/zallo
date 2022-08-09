import { AccountEvent } from 'lib';
import { expect, deploy, deployFactory } from './util';

describe('Factory', () => {
  it('Deploys', async () => {
    await deployFactory('ERC1967Proxy');
  });

  it('Calculated address matches deploy', async () => {
    const { account, deployTx } = await deploy();
    await expect(deployTx).to.emit(account, AccountEvent.WalletUpserted);
  });

  it('Deploys account', async () => {
    const { account, deployTx } = await deploy();
    await expect(deployTx).to.emit(account, AccountEvent.WalletUpserted);
  });
});
