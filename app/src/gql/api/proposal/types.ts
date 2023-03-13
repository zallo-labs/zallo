import { Address, Hex, Tx, KeySet, asHex, asAddress, asBigInt, asPolicyKey, PolicyKey } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { ProposalFieldsFragment } from '@api/generated';
import { AccountId, asAccountId } from '@api/account';

export type ProposalId = Hex & { isProposalId: true };
export const asProposalId = (id: string) => asHex(id) as ProposalId;

export interface Proposal extends Tx {
  id: ProposalId;
  account: AccountId;
  state: ProposalState;
  approvals: KeySet<Address, Approval>;
  rejections: KeySet<Address, Rejection>;
  satisfiablePolicies: SatisfiablePolicy[];
  submissions: Submission[];
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

export interface Submission {
  hash: Hex;
  status: SubmissionStatus;
  timestamp: DateTime;
  gasLimit: bigint;
  gasPrice?: bigint;
  response?: SubmissionResponse;
}

export type SubmissionStatus = 'pending' | 'success' | 'failure';

export interface SubmissionResponse {
  response: Hex;
  reverted: boolean;
  timestamp: DateTime;
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

  const transactions =
    p?.transactions?.map(
      (s): Submission => ({
        hash: asHex(s.hash),
        status: !s.response ? 'pending' : s.response.success ? 'success' : 'failure',
        timestamp: DateTime.fromISO(s.createdAt),
        gasLimit: BigInt(s.gasLimit),
        gasPrice: s.gasPrice ? asBigInt(s.gasPrice) : undefined,
        response: s.response
          ? {
              response: asHex(s.response.response),
              reverted: !s.response.success,
              timestamp: DateTime.fromISO(s.response.timestamp),
            }
          : undefined,
      }),
    ) ?? [];

  const state = match<Submission | undefined, ProposalState>(transactions[transactions.length - 1])
    .with(undefined, () => 'pending')
    .with({ status: 'pending' }, () => 'executing')
    .with({ status: 'success' }, () => 'executed')
    .with({ status: 'failure' }, () => 'failed')
    .exhaustive();

  return {
    id: asProposalId(p.id),
    account,
    state,
    to: asAddress(p.to),
    value: p.value ? BigInt(p.value) : undefined,
    data: asHex(p.data ?? undefined),
    nonce: BigInt(p.nonce),
    approvals,
    rejections,
    satisfiablePolicies,
    submissions: transactions,
    proposedAt: DateTime.fromISO(p.createdAt),
    proposer: asAddress(p.proposerId),
    timestamp: DateTime.fromISO(p.createdAt),
  };
};
