import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';

export function getSafeObjId(safe: Address): string {
  // {address}
  return safe.toHex();
}

export function getApproverId(approver: Address): string {
  // {address}
  return approver.toHex();
}

export function getGroupId(safe: Address, hash: Bytes): string {
  // {safe.id}-{hash}
  return `${safe.toHex()}-${hash.toHex()}`;
}

export function getGroupApproverId(
  groupId: string,
  approverId: string,
): string {
  // {group.id}-{approver.id}
  return `${groupId}-${approverId}`;
}

export function getDepositId(e: ethereum.Event): string {
  // {tx.hash}-{tx.log.index}
  return `${e.transaction.hash.toHex()}-${e.transactionLogIndex}`;
}

export function getTxId(tx: ethereum.Transaction): string {
  // {tx.hash}
  return tx.hash.toHex();
}

export function getTokenTransferId(e: ethereum.Event): string {
  // {tx.hash}-{tx.log.index}
  return `${e.transaction.hash.toHex()}-${e.transactionLogIndex}`;
}
