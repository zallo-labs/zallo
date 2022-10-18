import { AccountEvent } from 'lib';
import { expect, deploy, deployFactory } from './util';

describe('Factory', () => {
  it('Deploys', async () => {
    await deployFactory('ERC1967Proxy');
  });

  it('Deploys account', async () => {
    const { account, deployTx } = await deploy();
    await expect(deployTx).to.emit(account, AccountEvent.UserUpserted);
  });
});
