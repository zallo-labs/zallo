import { BytesLike, BigNumber } from 'ethers';
import { Address, TxReq, Id, createIsObj } from 'lib';
import { DateTime } from 'luxon';
import { Transfer } from './transfer.sub';

export interface Approval {
  addr: Address;
  signature: BytesLike;
  timestamp: DateTime;
}

export interface Submission {
  hash: BytesLike;
  nonce: number;
  gasLimit: BigNumber;
  gasPrice?: BigNumber;
  finalized: boolean;
  createdAt: DateTime;
}

export interface TxId {
  account: Address;
  hash: string;
}

export interface TxMetadata extends TxId {
  id: Id;
  timestamp: DateTime;
}

export interface ProposedTx extends TxMetadata, TxReq {
  approvals: Approval[];
  userHasApproved: boolean;
  submissions: Submission[];
  proposedAt: DateTime;
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

export const QUERY_TXS_POLL_INTERVAL = 10 * 1000;
