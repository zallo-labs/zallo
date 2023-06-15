import {
  Address,
  Hex,
  KeySet,
  asHex,
  asAddress,
  asBigInt,
  asPolicyKey,
  PolicyKey,
  Operation,
} from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { OperationFieldsFragment, TransactionProposalFieldsFragment } from '@api/generated';
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
  user: Address;
  timestamp: DateTime;
}

export interface Rejection {
  id: string;
  user: Address;
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
  response?: Hex;
  gasUsed: bigint;
  fee: bigint;
  timestamp: DateTime;
  transfers: Transfer[];
}

export const toProposal = (p: TransactionProposalFieldsFragment): Proposal => {
  const account = asAccountId(p.account.address);

  const approvals = new KeySet<Address, Approval>(
    (a) => a.user,
    (p.approvals ?? []).map((a) => ({
      id: a.id,
      user: a.user.address,
      timestamp: DateTime.fromISO(a.createdAt),
    })),
  );

  const rejections = new KeySet<Address, Rejection>(
    (a) => a.user,
    p.rejections.map((r) => ({
      id: r.id,
      user: r.user.address,
      timestamp: DateTime.fromISO(r.createdAt),
    })),
  );

  const satisfiablePolicies: SatisfiablePolicy[] = p.satisfiablePolicies.map((p) => ({
    account,
    key: asPolicyKey(p.key),
    satisfied: p.satisfied,
    responseRequested: p.responseRequested,
  }));

  const policy = p.policy
    ? satisfiablePolicies.find((policy) => policy.key === p.policy!.key) ?? {
        account,
        key: asPolicyKey(p.policy!.key),
        satisfied: false,
        unsatisfiable: true,
        responseRequested: false,
      }
    : satisfiablePolicies[0];

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
              response: asHex(t.receipt.response),
              gasUsed: asBigInt(t.receipt.gasUsed),
              fee: asBigInt(t.receipt.fee),
              timestamp: DateTime.fromISO(t.receipt.timestamp),
              transfers: (t.receipt.transfers ?? []).map((transfer) => ({
                id: transfer.id,
                direction: transfer.direction,
                token: asAddress(transfer.token),
                from: asAddress(transfer.from),
                to: asAddress(transfer.to),
                amount: asBigInt(transfer.amount) * (transfer.from === account ? -1n : 1n),
                timestamp: DateTime.fromISO(t.receipt!.timestamp),
              })),
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
    policy,
    satisfiablePolicies,
    simulation,
    transaction,
    proposedBy: p.proposedBy.address,
    proposedAt: createdAt,
    timestamp: createdAt,
    updatable: state === 'pending' || state === 'failed',
  };
};
