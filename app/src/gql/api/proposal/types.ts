import { BytesLike, BigNumber } from 'ethers';
import { Address, Hex, Tx, KeySet, asHex, asAddress } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { ProposalFieldsFragment } from '@api/generated';

export type ProposalId = Hex & { isProposalId: true };
export const asProposalId = (id: string) => asHex(id) as ProposalId;

export interface Proposal extends Tx {
  id: ProposalId;
  account: Address;
  state: ProposalState;
  approvals: KeySet<Address, Approval>;
  rejections: KeySet<Address, Rejection>;
  submissions: Submission[];
  proposedAt: DateTime;
  proposer: Address;
  createdAt: DateTime;
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

export interface Submission {
  hash: BytesLike;
  status: SubmissionStatus;
  timestamp: DateTime;
  gasLimit: BigNumber;
  gasPrice?: BigNumber;
  response?: SubmissionResponse;
}

export type SubmissionStatus = 'pending' | 'success' | 'failure';

export interface SubmissionResponse {
  response: BytesLike;
  reverted: boolean;
  timestamp: DateTime;
}

export const toProposal = (p: ProposalFieldsFragment): Proposal => {
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

  const transactions =
    p?.transactions?.map(
      (s): Submission => ({
        hash: s.hash,
        status: !s.response ? 'pending' : s.response.success ? 'success' : 'failure',
        timestamp: DateTime.fromISO(s.createdAt),
        gasLimit: BigNumber.from(s.gasLimit),
        gasPrice: s.gasPrice ? BigNumber.from(s.gasPrice) : undefined,
        response: s.response
          ? {
              response: s.response.response,
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
    account: asAddress(p.accountId),
    state,
    to: asAddress(p.to),
    value: p.value ? BigInt(p.value) : undefined,
    data: asHex(p.data ?? undefined),
    nonce: BigInt(p.nonce),
    approvals,
    rejections,
    submissions: transactions,
    proposedAt: DateTime.fromISO(p.createdAt),
    proposer: asAddress(p.proposerId),
    createdAt: DateTime.fromISO(p.createdAt),
  };
};
