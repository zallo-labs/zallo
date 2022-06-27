import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';

export function getSafeId(safe: Address): string {
  // {address}
  return safe.toHex();
}

export function getUserId(user: Address): string {
  // {address}
  return user.toHex();
}

export function getGroupId(safeId: string, ref: Bytes): string {
  // {safe.id}-{hash}
  return `${safeId}-${ref.toHex()}`;
}

export function getApproverSetId(groupId: string, blockHash: Bytes): string {
  // {groupId}-{blockHash}
  return `${groupId}-${blockHash.toHex()}`;
}

export function getApproverId(setId: string, userId: string): string {
  // {set.id}-{approver.id}
  return `${setId}-${userId}`;
}

export function getReceiveId(e: ethereum.Event): string {
  // {tx.hash}-{tx.log.index}
  return `${e.transaction.hash.toHex()}-${e.transactionLogIndex}`;
}

export function getTxId(tx: ethereum.Transaction): string {
  // {tx.hash}
  return tx.hash.toHex();
}

export function getTransferId(e: ethereum.Event): string {
  // {tx.hash}-{tx.log.index}
  return `${e.transaction.hash.toHex()}-${e.transactionLogIndex}`;
}
