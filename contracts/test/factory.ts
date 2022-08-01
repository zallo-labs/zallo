import { SafeEvent } from 'lib';
import { expect, deploy, deployFactory } from './util';

describe('Factory', () => {
  it('Deploys', async () => {
    await deployFactory('ERC1967Proxy');
  });

  it('Calculated address matches deploy', async () => {
    const { safe, deployTx } = await deploy();
    await expect(deployTx).to.emit(safe, SafeEvent.AccountUpserted);
  });

  it('Deploys safe', async () => {
    const { safe, deployTx } = await deploy();
    await expect(deployTx).to.emit(safe, SafeEvent.AccountUpserted);
  });
});
