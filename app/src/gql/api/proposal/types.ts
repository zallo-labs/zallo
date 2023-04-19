import { Address, Hex, Tx, KeySet, asHex, asAddress, asBigInt, asPolicyKey, PolicyKey } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { ProposalFieldsFragment } from '@api/generated';
import { AccountId, Transfer, asAccountId } from '@api/account/types';

export type ProposalId = Hex & { isProposalId: true };
export const asProposalId = (id: string) => asHex(id) as ProposalId;

export interface Proposal extends Tx {
  id: ProposalId;
  account: AccountId;
  gasLimit?: bigint;
  estimatedOpGas: bigint;
  feeToken?: Address;
  state: ProposalState;
  approvals: KeySet<Address, Approval>;
  rejections: KeySet<Address, Rejection>;
  satisfiablePolicies: SatisfiablePolicy[];
  requiresUserAction: boolean;
  simulation?: Simulation;
  transaction?: Transaction;
  proposedAt: DateTime;
  proposer: Address;
  timestamp: DateTime;
}

export type ProposalState = 'pending' | 'executing' | 'executed' | 'failed';

export interface Approval {
  approver: Address;
  signature: Hex;
  timestamp: DateTime;
}

export interface Rejection {
  approver: Address;
  signature?: never;
  timestamp: DateTime;
}

export interface SatisfiablePolicy {
  account: AccountId;
  key: PolicyKey;
  satisfied: boolean;
  requiresUserAction: boolean;
}

export interface Simulation {
  transfers: Transfer[];
}

export interface Transaction {
  hash: Hex;
  status: TransactionStatus;
  timestamp: DateTime;
  gasLimit: bigint;
  gasPrice?: bigint;
  receipt?: TransactionReceipt;
}

export type TransactionStatus = 'pending' | 'success' | 'failure';

export interface TransactionReceipt {
  success: boolean;
  response?: Hex;
  gasUsed: bigint;
  gasPrice: bigint;
  fee: bigint;
  timestamp: DateTime;
  transfers: Transfer[];
}

export const toProposal = (p: ProposalFieldsFragment): Proposal => {
  const account = asAccountId(p.accountId);

  const approvals = new KeySet<Address, Approval>(
    (a) => a.approver,
    (p.approvals ?? []).map((a) => ({
      approver: asAddress(a.userId),
      signature: asHex(a.signature!), // Resolver filters out rejects. TODO: reflect in type
      timestamp: DateTime.fromISO(a.createdAt),
    })),
  );

  const rejections = new KeySet<Address, Rejection>(
    (a) => a.approver,
    p.rejections.map((r) => ({
      approver: asAddress(r.userId),
      timestamp: DateTime.fromISO(r.createdAt),
    })),
  );

  const satisfiablePolicies: SatisfiablePolicy[] = p.satisfiablePolicies.map((p) => ({
    account,
    key: asPolicyKey(p.key),
    satisfied: p.satisfied,
    requiresUserAction: p.requiresUserAction,
  }));

  const createdAt = DateTime.fromISO(p.createdAt);

  const t = p.transaction;
  const transaction: Transaction | undefined = t
    ? {
        hash: asHex(t.hash),
        status: !t.receipt ? 'pending' : t.receipt.success ? 'success' : 'failure',
        timestamp: DateTime.fromISO(t.createdAt),
        gasLimit: asBigInt(t.gasLimit),
        gasPrice: t.gasPrice ? asBigInt(t.gasPrice) : undefined,
        receipt: t.receipt
          ? {
              success: t.receipt.success,
              response: asHex(t.receipt.response),
              gasUsed: asBigInt(t.receipt.gasUsed),
              gasPrice: asBigInt(t.receipt.gasPrice),
              fee: asBigInt(t.receipt.fee),
              timestamp: DateTime.fromISO(t.receipt.timestamp),
              transfers: (t.receipt.transfers ?? []).map((transfer) => ({
                direction: transfer.from === account ? 'OUT' : 'IN',
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
          direction: 'OUT',
          token: asAddress(t.token),
          from: asAddress(t.from),
          to: asAddress(t.to),
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
    id: asProposalId(p.id),
    account,
    to: asAddress(p.to),
    value: p.value ? asBigInt(p.value) : undefined,
    data: asHex(p.data ?? undefined),
    nonce: asBigInt(p.nonce),
    gasLimit: p.gasLimit ? asBigInt(p.gasLimit) : undefined,
    estimatedOpGas: asBigInt(p.estimatedOpGas),
    feeToken: p.feeToken ? asAddress(p.feeToken) : undefined,
    state,
    approvals,
    rejections,
    satisfiablePolicies,
    requiresUserAction: satisfiablePolicies.some((p) => p.requiresUserAction),
    simulation,
    transaction,
    proposedAt: createdAt,
    proposer: asAddress(p.proposerId),
    timestamp: createdAt,
  };
};
