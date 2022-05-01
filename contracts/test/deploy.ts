import { SafeEvent, toGroup } from 'lib';
import {
  expect,
  wallet,
  deploy,
  deployFactory,
  deploySafeDirect,
} from './util';

describe('Deploy', async () => {
  describe('Safe', () => {
    it('Deploys directly', async () => {
      const group = toGroup([wallet.address, 100]);

      const { safe, deployTx } = await deploySafeDirect([group]);
      await expect(deployTx).to.emit(safe, SafeEvent.GroupAdded);
    });
  });

  describe('Factory', () => {
    it('Deploys', async () => {
      await deployFactory();
    });

    it('Calculated address matches deploy', async () => {
      const { safe, deployTx } = await deploy([100]);
      await expect(deployTx).to.emit(safe, SafeEvent.GroupAdded);
    });

    it('Deploys safe', async () => {
      const { safe, deployTx } = await deploy([100]);
      await expect(deployTx).to.emit(safe, SafeEvent.GroupAdded);
    });
  });
});
