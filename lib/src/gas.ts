import * as zk from 'zksync-web3';
import { Tx, asTransactionData } from './tx';
import { Address } from './address';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { ResultAsync } from 'neverthrow';

const ESTIMATED_POLICY_VERIFICATION_GAS = 100_000n;
const ESTIMATED_APPROVAL_GAS = 50_000n;

export const estimateTransactionTotalGas = (operationsGasLimit: bigint, approvers: number) =>
  operationsGasLimit +
  ESTIMATED_POLICY_VERIFICATION_GAS +
  ESTIMATED_APPROVAL_GAS * BigInt(approvers);

export const FALLBACK_OPERATIONS_GAS = 3_000_000n;

export const estimateTransactionOperationsGas = (
  provider: zk.Provider,
  account: Address,
  tx: Tx,
) => {
  return ResultAsync.fromPromise(
    (async () =>
      (
        await provider.estimateGas({
          ...asTransactionData(account, tx),
          from: account,
          type: EIP712_TX_TYPE,
          // customData.customSignature is always a 65 byte signature - https://github.com/zkSync-Community-Hub/zkync-developers/discussions/81
        })
      ).toBigInt())(),
    (e) => new Error('Transaction gas estimation failed', { cause: e }),
  );
};
