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

  const key = upsert ? upsert.key : removal;
  const policy = usePolicy(key ? { account, key } : undefined);

  if (!policy) return undefined;

  return upsert
    ? {
        type: 'addPolicy',
        ...policy,
      } /* satisfies DecodedAddPolicyFunction - https://github.com/expo/expo/issues/21788 */
    : removal
    ? { type: 'removePolicy', ...policy } /* satisfies DecodedRemovePolicyFunction */
    : undefined;
};
