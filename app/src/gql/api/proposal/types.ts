import { Address, Hex, Tx, KeySet, asHex, asAddress, asBigInt, asPolicyKey, PolicyKey } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { TransactionProposalFieldsFragment } from '@api/generated';
import { Transfer, asAccountId } from '@api/account/types';

export type ProposalId = Hex & { isProposalId: true };
export const asProposalId = (id: string) => asHex(id) as ProposalId;

export interface Proposal extends Omit<Tx, 'gasLimit'> {
  id: string;
  hash: ProposalId;
  account: Address;
  gasLimit: bigint;
  feeToken?: Address;
  state: ProposalState;
  approvals: KeySet<Address, Approval>;
  rejections: KeySet<Address, Rejection>;
  satisfiablePolicies: SatisfiablePolicy[];
  requiresUserAction: boolean;
  simulation?: Simulation;
  transaction?: Transaction;
  proposedBy: Address;
  proposedAt: DateTime;
  timestamp: DateTime;
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
  requiresUserAction: boolean;
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
    requiresUserAction: p.requiresUserAction,
  }));

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
    hash: asProposalId(p.hash),
    account,
    to: p.to,
    value: p.value ? asBigInt(p.value) : undefined,
    data: p.data ?? undefined,
    nonce: asBigInt(p.nonce),
    gasLimit: asBigInt(p.gasLimit),
    feeToken: p.feeToken,
    state,
    approvals,
    rejections,
    satisfiablePolicies,
    requiresUserAction: satisfiablePolicies.some((p) => p.requiresUserAction),
    simulation,
    transaction,
    proposedBy: p.proposedBy.address,
    proposedAt: createdAt,
    timestamp: createdAt,
  };
};
