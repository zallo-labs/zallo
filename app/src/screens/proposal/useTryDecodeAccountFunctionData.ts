import { usePolicy, WPolicy } from '@api/policy';
import { BytesLike } from 'ethers';
import { Address, tryDecodeAddPolicyFunctionData, tryDecodeRemovePolicyFunctionData } from 'lib';

export type DecodedAccountFunction = DecodedAddPolicyFunction | DecodedRemovePolicyFunction;
export type DecodedAddPolicyFunction = WPolicy & { type: 'addPolicy' };
export type DecodedRemovePolicyFunction = WPolicy & { type: 'removePolicy' };

export const useTryDecodeAccountFunctionData = (
  account: Address,
  data?: BytesLike,
): DecodedAccountFunction | undefined => {
  const upsert = tryDecodeAddPolicyFunctionData(data);
  const removal = tryDecodeRemovePolicyFunctionData(data);

  const policy = usePolicy(
    (upsert ? { ...upsert, account } : undefined) ||
      (removal ? { account, key: removal } : undefined),
  );

  if (!policy || (!upsert && !removal)) return undefined;

  return upsert
    ? ({ type: 'addPolicy', ...policy } satisfies DecodedAddPolicyFunction)
    : ({ type: 'removePolicy', ...policy } satisfies DecodedRemovePolicyFunction);
};
