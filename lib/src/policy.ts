import { defaultAbiCoder } from 'ethers/lib/utils';
import { A } from 'ts-toolbelt';
import { isSignatureRule, isTransactionRule, Rule, RULES_ABI } from './rules/rule';
import { asSignatureRule, asTransactionRule } from './rules/uitl';
import { asUint256 } from './evmTypes';
import { BigNumberish, ethers } from 'ethers';
import { PolicyStruct as BasePolicyStruct } from './contracts/Account';
import { AwaitedObj } from './util/mappedTypes';

export type PolicyStruct = AwaitedObj<BasePolicyStruct>;

export type PolicyKey = A.Type<bigint, 'PolicyKey'>;

export const asPolicyKey = (key: BigNumberish) => asUint256(key) as unknown as PolicyKey;

export class Policy {
  public readonly key: PolicyKey;

  constructor(key: BigNumberish, public verifiers: Rule[]) {
    this.key = asPolicyKey(key);
  }

  public static readonly ABI = `(uint256 key, ${RULES_ABI} signatureRules, ${RULES_ABI} transactionRules)`;
  get struct(): PolicyStruct {
    return {
      key: this.key,
      signatureRules: this.signatureRules.map((v) => v.struct),
      transactionRules: this.transactionRules.map((v) => v.struct),
    };
  }

  get signatureRules() {
    return this.verifiers.filter(isSignatureRule);
  }

  get transactionRules() {
    return this.verifiers.filter(isTransactionRule);
  }

  static fromStruct(data: PolicyStruct): Policy {
    const signatureVerifiers = data.signatureRules.map(asSignatureRule);
    const txVerifiers = data.transactionRules.map(asTransactionRule);

    return new Policy(data.key, [...signatureVerifiers, ...txVerifiers]);
  }

  get hash() {
    const { signatureRules, transactionRules } = this.struct;

    return ethers.utils.keccak256(
      defaultAbiCoder.encode([RULES_ABI, RULES_ABI], [signatureRules, transactionRules]),
    );
  }
}
