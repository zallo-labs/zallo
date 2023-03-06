import { BytesLike } from 'ethers';
import { hexDataLength, hexDataSlice } from 'ethers/lib/utils';
import { Account, Account__factory } from './contracts';
import { Rule, RuleKey, asRuleKey, RuleStruct } from './rule';
import { OnlyRequiredItems } from './util/mappedTypes';

export const getDataSighash = (data?: BytesLike) =>
  data && hexDataLength(data) >= 4 ? hexDataSlice(data, 0, 4) : undefined;

export const ACCOUNT_INTERFACE = Account__factory.createInterface();

export const ADD_RULE_FUNCTION =
  ACCOUNT_INTERFACE.functions['addRule((uint256,(uint8,bytes)[],(uint8,bytes)[]))'];
export const ADD_RULE_SIGHSAH = ACCOUNT_INTERFACE.getSighash(ADD_RULE_FUNCTION);

export const REMOVE_RULE_FUNCTION = ACCOUNT_INTERFACE.functions['removeRule(uint256)'];
export const REMOVE_RULE_SIGHASH = ACCOUNT_INTERFACE.getSighash(REMOVE_RULE_FUNCTION);

export const tryDecodeAddRuleFunctionData = (data?: BytesLike): Rule | undefined => {
  if (!data || getDataSighash(data) !== ADD_RULE_SIGHSAH) return undefined;

  try {
    const [rule] = ACCOUNT_INTERFACE.decodeFunctionData(ADD_RULE_FUNCTION, data) as [RuleStruct];

    return Rule.fromStruct(rule);
  } catch {
    return undefined;
  }
};

export const tryDecodeRemoveRuleFunctionData = (data?: BytesLike): RuleKey | undefined => {
  if (!data || getDataSighash(data) !== REMOVE_RULE_SIGHASH) return undefined;

  try {
    const [key] = ACCOUNT_INTERFACE.decodeFunctionData(
      REMOVE_RULE_FUNCTION,
      data,
    ) as OnlyRequiredItems<Parameters<Account['removeRule']>>;

    return asRuleKey(key);
  } catch {
    return undefined;
  }
};
