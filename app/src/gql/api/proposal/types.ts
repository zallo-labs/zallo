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
  transfers: Transfer[];
  transaction?: TransactionSubmission;
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

export interface TransactionSubmission {
  hash: Hex;
  status: TransactionStatus;
  timestamp: DateTime;
  gasLimit: bigint;
  gasPrice?: bigint;
  response?: TransactionResponse;
}

export type TransactionStatus = 'pending' | 'success' | 'failure';

export interface TransactionResponse {
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

  const transfers: Transfer[] = p.transfers.map((t) => ({
    direction: 'OUT',
    token: t.token,
    from: t.from,
    to: t.to,
    amount: asBigInt(t.amount),
    timestamp: createdAt,
  }));

  const t = p.transaction;
  const transaction: TransactionSubmission | undefined = t
    ? {
        hash: asHex(t.hash),
        status: !t.response ? 'pending' : t.response.success ? 'success' : 'failure',
        timestamp: DateTime.fromISO(t.createdAt),
        gasLimit: asBigInt(t.gasLimit),
        gasPrice: t.gasPrice ? asBigInt(t.gasPrice) : undefined,
        response: t.response
          ? {
              success: t.response.success,
              response: asHex(t.response.response || undefined),
              gasUsed: asBigInt(t.response.gasUsed),
              gasPrice: asBigInt(t.response.gasPrice),
              fee: asBigInt(t.response.fee),
              timestamp: DateTime.fromISO(t.response.timestamp),
              transfers: (t.response.transfers ?? []).map((transfer) => ({
                direction: transfer.from === account ? 'OUT' : 'IN',
                token: asAddress(transfer.token),
                from: asAddress(transfer.from),
                to: asAddress(transfer.to),
                amount: asBigInt(transfer.amount),
                timestamp: DateTime.fromISO(t.response!.timestamp),
              })),
            }
          : undefined,
      }
    : undefined;

  const state = match<TransactionSubmission | undefined, ProposalState>(transaction)
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
    transfers,
    transaction,
    proposedAt: createdAt,
    proposer: asAddress(p.proposerId),
    timestamp: createdAt,
  };
};
