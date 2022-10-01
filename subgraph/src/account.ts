import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Account, AccountImpl } from '../generated/schema';

export const ZERO_ADDR: Address = Address.zero();

export function getOrCreateImpl(
  addr: Address,
  block: ethereum.Block,
): AccountImpl {
  const id = getAccountImplId(addr);
  let impl = AccountImpl.load(id);
  if (!impl) {
    impl = new AccountImpl(id);
    impl.blockHash = block.hash;
    impl.timestamp = block.timestamp;
    impl.save();
  }

  return impl;
}

export function getOrCreateAccount(addr: Address, implId: Bytes): Account {
  const id = getAccountId(addr);
  let account = Account.load(id);
  if (!account) {
    account = new Account(id);
    account.impl = implId;
    account.save();
  }

  return account;
}

export function getOrCreateAccountWithoutImpl(
  addr: Address,
  block: ethereum.Block,
): Account {
  const impl = getOrCreateImpl(ZERO_ADDR, block);
  return getOrCreateAccount(addr, impl.id);
}

export function getAccountId(account: Address): Bytes {
  // {address}
  return account;
}

export function getAccountImplId(impl: Address): Bytes {
  // {address}
  return impl;
}
