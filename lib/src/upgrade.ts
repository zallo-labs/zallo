import { Address } from './addr';
import { Account } from './contracts';
import { createTx } from './tx';

export const createUpgradeToTx = (account: Account, newImpl: Address) =>
  createTx({
    to: account.address,
    data: account.interface.encodeFunctionData('upgradeTo', [newImpl]),
  });
