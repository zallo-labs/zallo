import { Transfer as TransferEvent } from '../generated/ERC20/ERC20';
import { getAccountId, getTransferId, getTxId } from './id';
import { Account, Transfer } from '../generated/schema';
import { Address } from '@graphprotocol/graph-ts';

const ETH_ADDR: Address = Address.fromString(
  '0x000000000000000000000000000000000000800a',
);
const ETH_SUB_ADDR: Address = Address.fromString(
  '0x0000000000000000000000000000000000000000',
);

function transformEthAddress(address: Address): Address {
  return address == ETH_ADDR ? ETH_SUB_ADDR : address;
}

export function handleTransfer(e: TransferEvent): void {
  // Only handle transfers from or to a account
  let account = Account.load(getAccountId(e.params.from));
  if (!account) account = Account.load(getAccountId(e.params.to));
  if (!account) return;

  const transfer = new Transfer(getTransferId(e));

  transfer.account = account.id;
  transfer.tx = getTxId(account.id, e.transaction);
  transfer.transactionHash = e.transaction.hash;
  transfer.token = transformEthAddress(e.address);
  transfer.type = account.id == e.params.from ? 'OUT' : 'IN';
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
//   let account = AccountObj.load(getAccountObjId(e.params.owner));
//   const type = account !== null ? 'SENT' : 'RECEIVED';

//   // Received
//   if (account === null) account = AccountObj.load(getAccountObjId(e.params.spender));

//   // Event not related to a Account
//   if (account === null) return;

//   const approval = new TokenTransferApproval(
//     `${e.transaction.hash.toHex()}-${e.transactionLogIndex.toString()}`,
//   );

//   // approval.token = getOrCreateToken(e.address).id;
//   approval.token = e.address;
//   approval.account = account.id;
//   approval.type = type;
//   approval.owner = e.params.owner;
//   approval.spender = e.params.spender;
//   approval.value = e.params.value;

//   approval.save();
// }
