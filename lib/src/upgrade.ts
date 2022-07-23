import { Address } from './addr';
import { Upgradeable } from './contracts';
import { createTx } from './tx';

export const createUpgradeToTx = (upgradeable: Upgradeable, newImpl: Address) =>
  createTx({
    to: upgradeable.address,
    data: upgradeable.interface.encodeFunctionData('upgradeTo', [newImpl]),
  });
