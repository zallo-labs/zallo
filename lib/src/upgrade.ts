import { Address } from './addr';
import { Safe } from './contracts';
import { createTx } from './tx';

export const createUpgradeToTx = (safe: Safe, newImpl: Address) =>
  createTx({
    to: safe.address,
    data: safe.interface.encodeFunctionData('upgradeTo', [newImpl]),
  });
