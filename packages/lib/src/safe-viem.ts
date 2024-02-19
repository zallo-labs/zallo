import { ChainConfig, Network } from 'chains';
import { fromPromise, ok, safeTry } from 'neverthrow';
import {
  Abi,
  CallErrorType,
  CallParameters,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  DecodeErrorResultReturnType,
} from 'viem';

export interface DecodeRevertErrorParams<TAbi extends Abi> {
  error: unknown;
  abi: TAbi;
}

export function decodeRevertError<TAbi extends Abi>({
  error: e,
}: DecodeRevertErrorParams<TAbi>): DecodeErrorResultReturnType<TAbi> | undefined {
  if (
    e instanceof ContractFunctionExecutionError &&
    e.cause instanceof ContractFunctionRevertedError &&
    e.cause.data
  ) {
    return e.cause.data as DecodeErrorResultReturnType<TAbi>;
  }
}

export type CallParams = CallParameters<ChainConfig> & { type: 'eip712'; network: Network };

export function simulate(params: CallParams) {
  return fromPromise(params.network.call(params), (e) => e as CallErrorType);
}

export function execute(params: CallParams) {
  const { network } = params;

  return fromPromise(
    (async () => {
      const transactionHash = await network.sendRawTransaction({
        serializedTransaction: network.chain.serializers!.transaction({
          ...params,
          from: typeof params.account === 'object' ? params.account.address! : params.account!,
          chainId: network.chain.id,
        }),
      });

      return { transactionHash };
    })(),
    (e) => e as CallErrorType,
  );
}

export function simulateAndExecute(params: CallParams) {
  return safeTry(async function* () {
    const { data } = yield* simulate(params).safeUnwrap();
    const { transactionHash } = yield* execute(params).safeUnwrap();

    return ok({ transactionHash, data });
  });
}
