import { RuleStruct as BaseRuleStruct } from '../contracts/Account';
import { AwaitedObj } from '../util/mappedTypes';

export const RULE_ABI = '(uint8 selector, bytes args)';
export const RULES_ABI = `${RULE_ABI}[]`;

export type RuleStruct = AwaitedObj<BaseRuleStruct>;

export type Rule = SignatureRule | TransactionRule;

export abstract class SignatureRule {
  abstract get struct(): RuleStruct;
}

export const isSignatureRule = (v: unknown): v is SignatureRule => v instanceof SignatureRule;

export abstract class TransactionRule {
  abstract get struct(): RuleStruct;
}

export const isTransactionRule = (v: unknown): v is TransactionRule => v instanceof TransactionRule;
