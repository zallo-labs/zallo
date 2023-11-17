import { Tx, asTransactionData } from './tx';
import { Address } from './address';
import { ResultAsync } from 'neverthrow';
import { Network } from './chains';
import type { EstimateGasErrorType } from 'viem';

const ESTIMATED_POLICY_VERIFICATION_GAS = 500_000n;
const ESTIMATED_APPROVAL_GAS = 20_000n;

export const estimateTransactionTotalGas = (operationsGasLimit: bigint, approvers: number) =>
  operationsGasLimit +
  ESTIMATED_POLICY_VERIFICATION_GAS +
  ESTIMATED_APPROVAL_GAS * BigInt(approvers);

export const FALLBACK_OPERATIONS_GAS = 3_000_000n;
5;

export interface EstimateOperationGasParams {
  network: Network;
  account: Address;
  tx: Tx;
}

export function estimateTransactionOperationsGas({
  network,
  account,
  tx,
}: EstimateOperationGasParams) {
  const { to, value, data } = asTransactionData(account, tx);

  // customSignature is always a 65 byte signature - https://github.com/zkSync-Community-Hub/zkync-developers/discussions/81
  return ResultAsync.fromPromise(
    (async () => network.estimateGas({ type: 'eip712', account, to, value, data }))(),
    (e) => e as EstimateGasErrorType,
  );
}
