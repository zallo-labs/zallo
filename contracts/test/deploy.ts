import { SafeEvent } from 'lib';
import {
  expect,
  wallet,
  deploy,
  deployFactory,
  deploySafeDirect,
  toSafeGroupTest,
} from './util';

describe('Deploy', async () => {
  describe('Safe', () => {
    it('Deploys directly', async () => {
      const group = toSafeGroupTest([wallet.address, 100]);

      const { safe, deployTx } = await deploySafeDirect([group.approvers]);
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
