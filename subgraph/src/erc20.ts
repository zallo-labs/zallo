import { Transfer } from '../generated/ERC20/ERC20';
import { getSafeObjId, getTokenTransferId, getTxId } from './id';
import { Safe as SafeObj, TokenTransfer, Tx } from '../generated/schema';

export function handleTransfer(e: Transfer): void {
  // Only handle transfers from or to a safe
  let safe = SafeObj.load(getSafeObjId(e.params.from));
  if (!safe) safe = SafeObj.load(getSafeObjId(e.params.to));
  if (!safe) return;

  const transfer = new TokenTransfer(getTokenTransferId(e));

  transfer.safe = safe.id;
  const txId = getTxId(e.transaction);
  if (Tx.load(txId)) transfer.tx = txId;
  transfer.token = e.address;
  transfer.type = safe.id == e.params.from.toHex() ? 'OUT' : 'IN';
  transfer.from = e.params.from;
  transfer.to = e.params.to;
  transfer.value = e.params.value;
  transfer.blockHash = e.block.hash;
  transfer.timestamp = e.block.timestamp;

  transfer.save();
}

// Breaks handleTransfer somehow...?
// export function handleApproval(e: Approval): void {
//   // Sent
//   let safe = SafeObj.load(getSafeObjId(e.params.owner));
//   const type = safe !== null ? 'SENT' : 'RECEIVED';

//   // Received
//   if (safe === null) safe = SafeObj.load(getSafeObjId(e.params.spender));

//   // Event not related to a Safe
//   if (safe === null) return;

//   const approval = new TokenTransferApproval(
//     `${e.transaction.hash.toHex()}-${e.transactionLogIndex.toString()}`,
//   );

//   // approval.token = getOrCreateToken(e.address).id;
//   approval.token = e.address;
//   approval.safe = safe.id;
//   approval.type = type;
//   approval.owner = e.params.owner;
//   approval.spender = e.params.spender;
//   approval.value = e.params.value;

//   approval.save();
// }
