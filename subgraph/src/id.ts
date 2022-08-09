import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';

export function getAccountId(account: Address): string {
  // {address}
  return account.toHex();
}

export function getAccountImplId(impl: Address): string {
  // {address}
  return impl.toHex();
}

export function getUserId(approver: Address): string {
  // {address}
  return approver.toHex();
}

export function getWalletId(accountId: string, ref: Bytes): string {
  // {account.id}-{hash}
  return `${accountId}-${ref.toHex()}`;
}

export function getTxId(tx: ethereum.Transaction): string {
  // {tx.hash}
  return tx.hash.toHex();
}

export function getTransferId(e: ethereum.Event): string {
  // {tx.hash}-{tx.log.index}
  return `${e.transaction.hash.toHex()}-${e.transactionLogIndex}`;
}
