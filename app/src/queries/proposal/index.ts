import { BytesLike, BigNumber } from 'ethers';
import { Address, Tx } from 'lib';
import { DateTime } from 'luxon';
import { CombinedQuorum } from '../useQuorum.api';

export type ProposalState = 'pending' | 'executing' | 'executed' | 'failed';

export interface ProposalId {
  id: string;
}

export interface ProposalMetadata extends ProposalId {
  timestamp: DateTime;
}

export interface Proposal extends ProposalMetadata, Tx {
  account: Address;
  state: ProposalState;
  quorum: CombinedQuorum;
  isApproved: boolean;
  approvals: Map<Address, Approval>;
  rejected: Map<Address, Rejection>;
  awaitingApproval: Set<Address>;
  submissions: Submission[];
  proposedAt: DateTime;
}

export interface Approval {
  addr: Address;
  signature: BytesLike;
  timestamp: DateTime;
}

export interface Rejection {
  addr: Address;
  timestamp: DateTime;
}

export type SubmissionStatus = 'pending' | 'success' | 'failure';

export interface Submission {
  hash: BytesLike;
  nonce: number;
  status: SubmissionStatus;
  timestamp: DateTime;
  gasLimit: BigNumber;
  gasPrice?: BigNumber;
  response?: SubmissionResponse;
}

export interface SubmissionResponse {
  response: BytesLike;
  reverted: boolean;
  timestamp: DateTime;
}
