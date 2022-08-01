import { Address } from '@graphprotocol/graph-ts';
import { Account, User, Safe } from '../generated/schema';
import { getUserId, getSafeId, getSafeImplId } from './id';

export const ZERO_ADDR: Address = Address.zero();

export function getOrCreateSafeWithImpl(addr: Address, impl: Address): Safe {
  const id = getSafeId(addr);
  let safe = Safe.load(id);
  if (!safe) {
    safe = new Safe(id);
    safe.impl = getSafeImplId(impl);
    safe.save();
  }

  return safe;
}

export function getOrCreateSafe(addr: Address): Safe {
  return getOrCreateSafeWithImpl(addr, ZERO_ADDR);
}

export function getOrCreateUser(addr: Address): User {
  const id = getUserId(addr);
  let approver = User.load(id);
  if (!approver) {
    approver = new User(id);
    approver.save();
  }

  return approver;
}

export function getOrCreateAccount(id: string): Account {
  let account = Account.load(id);
  if (!account) account = new Account(id);

  return account;
}
