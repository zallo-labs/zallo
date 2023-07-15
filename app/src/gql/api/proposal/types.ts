import { Address, Hex, KeySet, asHex, asBigInt, asPolicyKey, PolicyKey, Operation } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import {
  OperationFieldsFragment,
  TransactionProposalFieldsFragment,
  TransferFieldsFragment,
  TransferApprovalFieldsFragment,
} from '@api/generated';
import { asAccountId } from '@api/account/types';
import { Transfer } from '@api/transfer/types';

export interface ProposalOperation extends Operation {
  function?: OperationFieldsFragment['function'];
}

export interface Proposal {
  id: string;
  hash: Hex;
  account: Address;
  label?: string;
  operations: [ProposalOperation, ...ProposalOperation[]];
  nonce: bigint;
  gasLimit: bigint;
  feeToken: Address;
  state: ProposalState;
  approvals: KeySet<Address, Approval>;
  rejections: KeySet<Address, Rejection>;
  policy?: SatisfiablePolicy & { unsatisfiable?: boolean };
  satisfiablePolicies: SatisfiablePolicy[];
  simulation?: Simulation;
  transaction?: Transaction;
  proposedBy: Address;
  proposedAt: DateTime;
  timestamp: DateTime;
  updatable: boolean;
}

export type ProposalState = 'pending' | 'executing' | 'executed' | 'failed';

export interface Approval {
  id: string;
  approver: Address;
  timestamp: DateTime;
}

export interface Rejection {
  id: string;
  approver: Address;
  timestamp: DateTime;
}

export interface SatisfiablePolicy {
  account: Address;
  key: PolicyKey;
  satisfied: boolean;
  responseRequested: boolean;
}

export interface Simulation {
  transfers: Transfer[];
}

export interface Transaction {
  id: string;
  hash: Hex;
  status: TransactionStatus;
  timestamp: DateTime;
  gasPrice: bigint;
  receipt?: Receipt;
}

export type TransactionStatus = 'pending' | 'success' | 'failure';

export interface Receipt {
  success: boolean;
  responses: Hex[];
  gasUsed: bigint;
  fee: bigint;
  timestamp: DateTime;
  transferEvents: TransferFieldsFragment[];
  transferApprovalEvents: TransferApprovalFieldsFragment[];
}

export const toProposal = (p: TransactionProposalFieldsFragment): Proposal => {
  const account = asAccountId(p.account.address);

  const approvals = new KeySet<Address, Approval>(
    (a) => a.approver,
    (p.approvals ?? []).map((a) => ({
      id: a.id,
      approver: a.approver.address,
      timestamp: DateTime.fromISO(a.createdAt),
    })),
  );

  const rejections = new KeySet<Address, Rejection>(
    (a) => a.approver,
    p.rejections.map((r) => ({
      id: r.id,
      approver: r.approver.address,
      timestamp: DateTime.fromISO(r.createdAt),
    })),
  );

  const createdAt = DateTime.fromISO(p.createdAt);

  const t = p.transaction;
  const transaction: Transaction | undefined = t
    ? {
        id: t.id,
        hash: t.hash,
        status: !t.receipt ? 'pending' : t.receipt.success ? 'success' : 'failure',
        timestamp: DateTime.fromISO(t.submittedAt),
        gasPrice: asBigInt(t.gasPrice),
        receipt: t.receipt
          ? {
              success: t.receipt.success,
              responses: t.receipt.responses,
              gasUsed: asBigInt(t.receipt.gasUsed),
              fee: asBigInt(t.receipt.fee),
              timestamp: DateTime.fromISO(t.receipt.timestamp),
              transferEvents: t.receipt.transferEvents,
              transferApprovalEvents: t.receipt.transferApprovalEvents,
            }
          : undefined,
      }
    : undefined;

  const simulation: Simulation | undefined = p.simulation
    ? {
        transfers: (p.simulation.transfers ?? []).map((t) => ({
          id: t.id,
          direction: t.direction,
          token: t.token,
          from: t.from,
          to: t.to,
          amount: asBigInt(t.amount),
          timestamp: createdAt,
        })),
      }
    : undefined;

  const state = match<Transaction | undefined, ProposalState>(transaction)
    .with(undefined, () => 'pending')
    .with({ status: 'pending' }, () => 'executing')
    .with({ status: 'success' }, () => 'executed')
    .with({ status: 'failure' }, () => 'failed')
    .exhaustive();

  return {
    id: p.id,
    hash: p.hash,
    account,
    label: p.label || undefined,
    operations: p.operations.map(
      (o): ProposalOperation => ({
        to: o.to,
        value: o.value ? asBigInt(o.value) : undefined,
        data: o.data ? asHex(o.data) : undefined,
        function: o.function,
      }),
    ) as [ProposalOperation, ...ProposalOperation[]],
    nonce: asBigInt(p.nonce),
    gasLimit: asBigInt(p.gasLimit),
    feeToken: p.feeToken,
    state,
    approvals,
    rejections,
    policy: undefined,
    satisfiablePolicies: [],
    simulation,
    transaction,
    proposedBy: p.proposedBy.address,
    proposedAt: createdAt,
    timestamp: createdAt,
    updatable: state === 'pending' || state === 'failed',
  };
};
