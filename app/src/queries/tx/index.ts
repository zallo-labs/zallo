import { BytesLike, BigNumber } from 'ethers';
import { isBytesLike } from 'ethers/lib/utils';
import { Address, TxReq, Id, createIsObj, createIs } from 'lib';
import { DateTime } from 'luxon';
import { WalletId } from '../wallets';
import { Transfer } from './transfer.sub';

export interface Approval {
  addr: Address;
  signature: BytesLike;
  timestamp: DateTime;
}

export type SubmissionStatus = "pending" | "success" | "failure";

export interface Submission {
  hash: BytesLike;
  nonce: number;
  status: SubmissionStatus;
  timestamp: DateTime;
  gasLimit: BigNumber;
  gasPrice?: BigNumber;
}

export const isSubmission = createIs<Submission>({
  hash: isBytesLike,
  nonce: 'number',
  gasLimit: BigNumber.isBigNumber,
  gasPrice: (e) => BigNumber.isBigNumber(e) || e === undefined,
  timestamp: DateTime.isDateTime,
  status: 'string',
});

export interface TxId {
  account: Address;
  hash: string;
}

export type TxStatus = 'proposed' | 'submitted' | 'failed' | 'executed';

export interface TxMetadata extends TxId {
  id: Id;
  timestamp: DateTime;
}

export interface ProposedTx extends TxMetadata, TxReq {
  wallet?: WalletId;
  approvals: Approval[];
  userHasApproved: boolean;
  submissions: Submission[];
  proposedAt: DateTime;
  status: TxStatus;
}

export interface ExecutedTx extends ProposedTx {
  response: BytesLike;
  executor: Address;
  executedAt: DateTime;
  blockHash: BytesLike;
  transfers: Transfer[];
}

export type Tx = ProposedTx | ExecutedTx;

export const isTx = createIsObj<Tx>('hash', 'approvals', 'submissions');

export const isExecutedTx = (e: unknown): e is ExecutedTx =>
  isTx(e) && 'responses' in e;

export const isProposedTx = (e: unknown): e is ProposedTx =>
  isTx(e) && !('responses' in e);

export const QUERY_TXS_METADATA_POLL_INTERVAL = 10 * 1000;
export const QUERY_TX_POLL_INTERVAL = 5 * 1000;
