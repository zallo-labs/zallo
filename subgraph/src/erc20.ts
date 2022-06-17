import { Transfer as TransferEvent } from '../generated/ERC20/ERC20';
import { getSafeObjId, getTransferId, getTxId } from './id';
import { Safe as SafeObj, Transfer } from '../generated/schema';

export function handleTransfer(e: TransferEvent): void {
  // Only handle transfers from or to a safe
  let safe = SafeObj.load(getSafeObjId(e.params.from));
  if (!safe) safe = SafeObj.load(getSafeObjId(e.params.to));
  if (!safe) return;

  const transfer = new Transfer(getTransferId(e));

  transfer.safe = safe.id;
  transfer.tx = getTxId(e.transaction);
  transfer.txHash = e.transaction.hash;
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
