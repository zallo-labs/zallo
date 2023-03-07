import { isPresent } from '../util/arrays';
import { RuleStruct, SignatureRule, TransactionRule } from './rule';
import { ApprovalsRule } from './approvals';
import { FunctionRule } from './function';
import { TargetRule } from './target';

export enum RuleSelector {
  Approvals,
  Function,
  AnyOfFunctions,
  Target,
  AnyOfTargets,
}

export const asSignatureRule = (data: RuleStruct): SignatureRule =>
  fromStruct<SignatureRule>(data, [ApprovalsRule.tryFromStruct]);

export const asTransactionRule = (data: RuleStruct): TransactionRule =>
  fromStruct<TransactionRule>(data, [FunctionRule.tryFromStruct, TargetRule.tryFromStruct]);

const fromStruct = <T>(
  data: RuleStruct,
  verifiersTryFromStruct: ((data: RuleStruct) => T | undefined)[],
): T => {
  const verifiers = verifiersTryFromStruct
    .map((tryFromStruct) => tryFromStruct(data))
    .filter(isPresent);

  if (verifiers.length === 0) throw new Error(`Invalid VerifierStruct: ${data}`);
  if (verifiers.length > 1) throw new Error(`Ambiguous VerifierStruct: ${data}`);

  return verifiers[0];
};
