import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';

export function getAccountId(account: Address): Bytes {
  // {address}
  return account;
}

export function getAccountImplId(impl: Address): Bytes {
  // {address}
  return impl;
}

export function getUserId(approver: Address): Bytes {
  // {address}
  return approver;
}

export function getWalletId(accountId: Bytes, ref: Bytes): string {
  // {account.id}-{ref}
  return `${accountId.toHex()}-${ref.toHex()}`;
}

export function getTxId(accountId: Bytes, transaction: ethereum.Transaction): string {
  // {account.id}-{transaction.hash}
  return `${accountId.toHex()}-${transaction.hash.toHex()}`;
}

export function getTransferId(e: ethereum.Event): string {
  // {tx.hash}-{tx.log.index}
  return `${e.transaction.hash.toHex()}-${e.transactionLogIndex}`;
}
