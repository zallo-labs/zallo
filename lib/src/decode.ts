import { BytesLike } from 'ethers';
import { hexDataLength, hexDataSlice } from 'ethers/lib/utils';
import { Account, Account__factory } from './contracts';
import { Policy, PolicyKey, asPolicyKey, PolicyStruct, POLICY_ABI } from './policy';
import { OnlyRequiredItems } from './util/types';
import { Selector, asSelector } from './bytes';

export const getSelector = (data?: BytesLike) =>
  data && hexDataLength(data) >= 4 ? hexDataSlice(data, 0, 4) : undefined;

export const ACCOUNT_INTERFACE = Account__factory.createInterface();

export const ADD_POLICY_FUNCTION =
  ACCOUNT_INTERFACE.functions['addPolicy((uint32,uint8,address[],(uint8,bytes)[]))'];
export const ADD_POLICY_SELECTOR = ACCOUNT_INTERFACE.getSighash(ADD_POLICY_FUNCTION) as Selector;

export const REMOVE_POLICY_FUNCTION = ACCOUNT_INTERFACE.functions['removePolicy(uint32)'];
export const REMOVE_POLICY_SELECTOR = ACCOUNT_INTERFACE.getSighash(
  REMOVE_POLICY_FUNCTION,
) as Selector;

export const tryDecodeAddPolicyFunctionData = (data?: BytesLike): Policy | undefined => {
  if (!data || asSelector(data) !== ADD_POLICY_SELECTOR) return undefined;

  try {
    const [policy] = ACCOUNT_INTERFACE.decodeFunctionData(ADD_POLICY_FUNCTION, data) as [
      PolicyStruct,
    ];

    return POLICY_ABI.fromStruct(policy);
  } catch {
    return undefined;
  }
};

export const tryDecodeRemovePolicyFunctionData = (data?: BytesLike): PolicyKey | undefined => {
  if (!data || getSelector(data) !== REMOVE_POLICY_SELECTOR) return undefined;

  try {
    const [key] = ACCOUNT_INTERFACE.decodeFunctionData(
      REMOVE_POLICY_FUNCTION,
      data,
    ) as OnlyRequiredItems<Parameters<Account['removePolicy']>>;

    return asPolicyKey(key);
  } catch {
    return undefined;
  }
};
