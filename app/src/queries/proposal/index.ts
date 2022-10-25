import { BytesLike, BigNumber } from 'ethers';
import { Address, TxReq, Id, UserId, UserConfig } from 'lib';
import { DateTime } from 'luxon';

export type ProposalStatus = 'proposed' | 'submitted' | 'failed' | 'executed';

export interface ProposalId {
  hash: string;
}

export interface ProposalMetadata extends ProposalId {
  id: Id;
  timestamp: DateTime;
}

export interface Proposal extends ProposalMetadata, TxReq {
  account: Address;
  proposer: UserId;
  config: UserConfig;
  approvals: Approval[];
  userHasApproved: boolean;
  submissions: Submission[];
  proposedAt: DateTime;
  status: ProposalStatus;
}

export interface Approval {
  addr: Address;
  signature: BytesLike;
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
