import {
  Deposit as DepositEvent,
  Execution,
  GroupAdded,
  GroupRemoved,
} from '../generated/Safe/Safe';
import {
  Deposit,
  Group,
  GroupApprover,
  Transaction,
  TransactionApprover,
} from '../generated/schema';
import {
  getApproverId,
  getDepositId,
  getGroupApproverId,
  getGroupId,
  getSafeObjId,
  getTransactionApproverId,
  getTransactionId,
} from './id';
import {
  getOrCreateApprover,
  getOrCreateSafeObj,
  getSafe,
  hashGroup,
} from './util';

export function handleGroupAdded(e: GroupAdded): void {
  const safe = getSafe(e);
  const hash = hashGroup(e.params.approvers);
  const id = getGroupId(safe._address, hash);

  const group = new Group(id);
  group.safe = getOrCreateSafeObj(safe._address).id;
  group.hash = hash;
  group.active = true;

  group.save();

  // Create GroupApprovers & maybe Approver
  for (let i = 0; i < e.params.approvers.length; i++) {
    const approverStruct = e.params.approvers[i];
    const approverId = getOrCreateApprover(approverStruct.addr).id;

    const groupApprover = new GroupApprover(getGroupApproverId(id, approverId));
    groupApprover.group = id;
    groupApprover.approver = approverId;
    groupApprover.weight = approverStruct.weight;

    groupApprover.save();
  }
}

export function handleGroupRemoved(e: GroupRemoved): void {
  const group = Group.load(getGroupId(e.address, e.params.groupHash));
  if (group) {
    group.active = false;
    group.save();
  }
}

export function handleDeposit(e: DepositEvent): void {
  const deposit = new Deposit(getDepositId(e));

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

  const id = getTransactionId(safe, p.tx);
  const tx = new Transaction(id);

  tx.safe = getSafeObjId(safe._address);
  tx.to = p.tx.to;
  tx.value = p.tx.value;
  tx.data = p.tx.data;
  tx.nonce = p.tx.nonce;
  tx.response = p.response;
  tx.executor = e.transaction.from;
  tx.txHash = e.transaction.hash;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;
  tx.group = getGroupId(safe._address, p.groupHash);

  tx.save();

  // Create TransactionApprovers
  for (let i = 0; i < p.approvers.length; i++) {
    const approverId = getApproverId(p.approvers[i]);

    const txApprover = new TransactionApprover(
      getTransactionApproverId(id, approverId),
    );
    txApprover.transaction = tx.id;
    txApprover.approver = approverId;

    txApprover.save();
  }
}
