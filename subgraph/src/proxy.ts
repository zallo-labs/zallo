import { Upgraded } from '../generated/Account/Account';
import { AccountImpl } from '../generated/schema';
import { getAccountImplId } from './id';
import { getOrCreateAccount } from './util';

export function handleUpgraded(e: Upgraded): void {
  const implId = getAccountImplId(e.params.implementation);
  let impl = AccountImpl.load(implId);
  if (!impl) {
    impl = new AccountImpl(implId);
    impl.blockHash = e.block.hash;
    impl.timestamp = e.block.timestamp;
    impl.save();
  }

  const account = getOrCreateAccount(e.address);
  account.impl = impl.id;
  account.save();
}
