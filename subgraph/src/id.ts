import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';

export function getSafeId(safe: Address): string {
  // {address}
  return safe.toHex();
}

export function getSafeImplId(impl: Address): string {
  // {address}
  return impl.toHex();
}

export function getUserId(approver: Address): string {
  // {address}
  return approver.toHex();
}

export function getAccountId(safeId: string, ref: Bytes): string {
  // {safe.id}-{hash}
  return `${safeId}-${ref.toHex()}`;
}

export function getTxId(tx: ethereum.Transaction): string {
  // {tx.hash}
  return tx.hash.toHex();
}

export function getTransferId(e: ethereum.Event): string {
  // {tx.hash}-{tx.log.index}
  return `${e.transaction.hash.toHex()}-${e.transactionLogIndex}`;
}
