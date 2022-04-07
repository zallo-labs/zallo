import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  Deposit as DepositEvent,
  Execution,
  GroupAdded,
  GroupRemoved,
  Safe__hashGroupInput_approversStruct,
  Safe__hashTxInput_txStruct,
} from '../generated/Safe/Safe';
import {
  Approver,
  Deposit,
  Group,
  GroupApprover,
  Transaction,
  TransactionApprover,
  Safe as SafeObj,
} from '../generated/schema';
import { getApproverId, getSafe, getSafeObjId, getTxApproverId } from './util';

/* UTIL */
function getEventId(e: ethereum.Event): string {
  return `${e.transaction.hash.toHex()}-${e.transactionLogIndex}`;
}

function getGroupId(safe: Address, hash: Bytes): string {
  return `${safe.toHex()}-${hash.toHex()}`;
}

function getOrCreateSafeObj(addr: Address): SafeObj {
  const id = getSafeObjId(addr);
  let safeObj = SafeObj.load(id);
  if (!safeObj) {
    safeObj = new SafeObj(id);
    safeObj.save();
  }

  return safeObj;
}

function getOrCreateApprover(addr: Address): Approver {
  const id = getApproverId(addr);
  let approver = Approver.load(id);
  if (!approver) {
    approver = new Approver(id);
    approver.save();
  }

  return approver;
}

/* HANDLERS */
export function handleGroupAdded(e: GroupAdded): void {
  const safe = getSafe(e);
  const hash = safe.hashGroup(
    changetype<Array<Safe__hashGroupInput_approversStruct>>(e.params.approvers),
  );
  const id = getGroupId(safe._address, hash);

  const group = new Group(id);
  group.safe = getOrCreateSafeObj(safe._address).id;
  group.hash = hash;
  group.active = true;

  group.save();

  // Create GroupApprovers
  for (let i = 0; i < e.params.approvers.length; i++) {
    const approver = e.params.approvers[i];

    const groupApprover = new GroupApprover(
      `${safe._address.toHex()}-${hash.toHex()}-${approver.addr.toHex()}`,
    );
    groupApprover.group = id;
    groupApprover.approver = getOrCreateApprover(approver.addr).id;
    groupApprover.weight = approver.weight;

    groupApprover.save();
  }
}

export function handleGroupRemoved(e: GroupRemoved): void {
  const id = getGroupId(e.address, e.params.groupHash);
  const group = Group.load(id);
  if (group) {
    group.active = false;
    group.save();
  }
}

export function handleDeposit(e: DepositEvent): void {
  const deposit = new Deposit(getEventId(e));
  deposit.safe = getSafeObjId(e.address);
  deposit.from = e.params.from;
  deposit.value = e.params.value;
  deposit.blockHash = e.block.hash;
  deposit.timestamp = e.block.timestamp;

  deposit.save();
}

export function handleExecution(e: Execution): void {
  const safe = getSafe(e);
  const p = e.params;

  const txHash = safe.hashTx(changetype<Safe__hashTxInput_txStruct>(p.tx));
  const id = txHash.toHex();

  const tx = new Transaction(id);
  tx.safe = getSafeObjId(safe._address);
  tx.to = p.tx.to;
  tx.value = p.tx.value;
  tx.data = p.tx.data;
  tx.nonce = p.tx.nonce;
  tx.response = p.response;
  tx.executor = p.executor;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;
  tx.group = getGroupId(safe._address, p.groupHash);

  tx.save();

  // Create TransactionApprovers
  for (let i = 0; i < p.approvers.length; i++) {
    const approver = p.approvers[i];
    const approverId = getApproverId(approver);

    const txApprover = new TransactionApprover(getTxApproverId(id, approverId));
    txApprover.transaction = tx.id;
    txApprover.approver = approver.toHex();

    txApprover.save();
  }
}
