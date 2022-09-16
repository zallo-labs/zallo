import { Upgraded } from '../generated/Account/Account';
import { getOrCreateAccount, getOrCreateImpl } from './account';

export function handleUpgraded(e: Upgraded): void {
  const impl = getOrCreateImpl(e.params.implementation, e.block);

  const account = getOrCreateAccount(e.address, impl.id);
  if (account.impl !== impl.id) {
    account.impl = impl.id;
    account.save();
  }
}
