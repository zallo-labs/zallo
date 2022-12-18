import { Address } from './addr';
import { Account } from './contracts';
import { toTx } from './tx';

export const createUpgradeToTx = (account: Account, newImpl: Address) =>
  toTx({
    to: account.address,
    data: account.interface.encodeFunctionData('upgradeTo', [newImpl]),
  });
