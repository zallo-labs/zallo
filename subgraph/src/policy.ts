import { BigInt, store } from '@graphprotocol/graph-ts';
import { PolicyAdded, PolicyRemoved } from '../generated/Account/Account';
import { Account, Policy } from '../generated/schema';
import { getOrCreateAccountWithoutImpl } from './account';

export function handlePolicyAdded(e: PolicyAdded): void {
  const account = getOrCreateAccountWithoutImpl(e.address, e.block);

  const id = getPolicyId(account, e.params.key);
  let policy = Policy.load(id);
  if (!policy) {
    policy = new Policy(id);
    policy.account = account.id;
    policy.key = e.params.key;
  }

  policy.hash = e.params.hash;

  policy.save();
}

export function handlePolicyRemoved(e: PolicyRemoved): void {
  const account = getOrCreateAccountWithoutImpl(e.address, e.block);

  const id = getPolicyId(account, e.params.key);
  if (Policy.load(id)) store.remove('Policy', id);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function getPolicyId(account: Account, key: BigInt): string {
  // {account.id}-{key}
  return `${account.id.toHex()}-${key}`;
}
