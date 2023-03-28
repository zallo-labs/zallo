import { isPresent } from '../util/arrays';
import { RuleStruct, SignatureRule, TransactionRule } from './rule';
import { ApprovalsRule } from './ApprovalsRule';
import { FunctionsRule } from './FunctionsRule';
import { TargetsRule } from './TargetsRule';

export const asSignatureRule = (data: RuleStruct): SignatureRule =>
  fromStruct<SignatureRule>(data, [ApprovalsRule.tryFromStruct]);

export const asTransactionRule = (data: RuleStruct): TransactionRule =>
  fromStruct<TransactionRule>(data, [FunctionsRule.tryFromStruct, TargetsRule.tryFromStruct]);

const fromStruct = <T>(
  data: RuleStruct,
  rulesTryFromStruct: ((data: RuleStruct) => T | undefined)[],
): T => {
  const rules = rulesTryFromStruct.map((tryFromStruct) => tryFromStruct(data)).filter(isPresent);

  if (rules.length === 0) throw new Error(`Invalid VerifierStruct: ${data}`);
  if (rules.length > 1) throw new Error(`Ambiguous VerifierStruct: ${data}`);

  return rules[0]!;
};
