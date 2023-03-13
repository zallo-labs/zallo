import { BytesLike, SignatureLike } from '@ethersproject/bytes';
import { providers } from 'ethers';
import { RuleStruct as BaseRuleStruct } from '../contracts/Account';
import { Tx } from '../tx';
import { AwaitedObj, MaybePromise } from '../util/types';

export const RULE_ABI = '(uint8 selector, bytes args)';
export const RULES_ABI = `${RULE_ABI}[]`;

export type RuleStruct = AwaitedObj<BaseRuleStruct>;

export type Rule = SignatureRule | TransactionRule;

export interface SignatureRuleIsSatisfiedOptions {
  provider: providers.Provider;
  digest: BytesLike;
  signatures: SignatureLike[];
}

export abstract class SignatureRule {
  abstract get struct(): RuleStruct;
  abstract isSatisfied(opts: SignatureRuleIsSatisfiedOptions): MaybePromise<boolean>;
}

export const isSignatureRule = (v: unknown): v is SignatureRule => v instanceof SignatureRule;

export interface TransactionRuleIsSatisfiedOptions {
  provider: providers.Provider;
  tx: Tx;
}

export abstract class TransactionRule {
  abstract get struct(): RuleStruct;
  abstract isSatisfied(opts: TransactionRuleIsSatisfiedOptions): MaybePromise<boolean>;
}

export const isTransactionRule = (v: unknown): v is TransactionRule => v instanceof TransactionRule;
