import { Address } from '@graphprotocol/graph-ts';
import { Wallet, User, Account } from '../generated/schema';
import { getUserId, getAccountId, getAccountImplId } from './id';

export const ZERO_ADDR: Address = Address.zero();

export function getOrCreateAccountWithImpl(
  addr: Address,
  impl: Address,
): Account {
  const id = getAccountId(addr);
  let account = Account.load(id);
  if (!account) {
    account = new Account(id);
    account.impl = getAccountImplId(impl);
    account.save();
  }

  return account;
}

export function getOrCreateAccount(addr: Address): Account {
  return getOrCreateAccountWithImpl(addr, ZERO_ADDR);
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

export function getOrCreateWallet(id: string): Wallet {
  let wallet = Wallet.load(id);
  if (!wallet) wallet = new Wallet(id);

  return wallet;
}
