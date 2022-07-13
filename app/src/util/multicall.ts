import { BigNumber, BytesLike } from 'ethers';
import {
  address,
  Call,
  CallDef,
  createCall,
  createTx,
  Multicall__factory,
  TxReq,
} from 'lib';
import { CallStructOutput } from 'lib/dist/contracts/contracts/Multicall';
import { CONFIG } from '~/config';
import { PROVIDER } from '~/provider';
import { getDataSighash } from '~/queries/useContractMethod';

export const MULTICALL = Multicall__factory.connect(
  CONFIG.multicallAddress!,
  PROVIDER,
);

export const callsToTxReq = async (callDefs: CallDef[]): Promise<TxReq> => {
  const calls = callDefs.map(createCall);

  const txDef =
    calls.length === 1
      ? calls[0]
      : await MULTICALL.populateTransaction.multicall(calls);

  return createTx(txDef);
};

const MULTICALL_SIGHASH = MULTICALL.interface.getSighash(
  MULTICALL.interface.functions['multicall((address,uint256,bytes)[])'],
);

export const txReqToCalls = (tx: TxReq): Call[] => {
  if (getDataSighash(tx.data) !== MULTICALL_SIGHASH) return [tx];

  const [calls] = MULTICALL.interface.decodeFunctionData(
    MULTICALL_SIGHASH,
    tx.data,
  ) as [CallStructOutput[]];

  return calls.map((c) => ({
    to: address(c.to),
    value: BigNumber.from(c.value),
    data: c.data,
  }));
};

export const tryGetMulticallResponsesFromResponse = (
  response: BytesLike,
): BytesLike[] => {
  try {
    const [responses] = MULTICALL.interface.decodeFunctionResult(
      'multicall',
      response,
    ) as [BytesLike[]];

    return responses;
  } catch (_) {
    return [response];
  }
};
