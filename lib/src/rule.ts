import { defaultAbiCoder } from 'ethers/lib/utils';
import { A } from 'ts-toolbelt';
import {
  isSignatureVerifier,
  isTransactionVerifier,
  Verifier,
  VERIFIERS_ABI,
} from './verifiers/verifier';
import { asSignatureVerifier, asTransactionVerifier } from './verifiers/uitl';
import { asUint256 } from './evmTypes';
import { BigNumberish, ethers } from 'ethers';
import { RuleStruct as BaseRuleStruct } from './contracts/Account';
import { AwaitedObj } from './util/mappedTypes';

export type RuleStruct = AwaitedObj<BaseRuleStruct>;

export type RuleKey = A.Type<bigint, 'RuleKey'>;

export const asRuleKey = (key: BigNumberish) => asUint256(key) as unknown as RuleKey;

export class Rule {
  public readonly key: RuleKey;

  constructor(key: BigNumberish, public verifiers: Verifier[]) {
    this.key = asRuleKey(key);
  }

  public static readonly ABI = `(uint256 key, ${VERIFIERS_ABI} signatureVerifiers, ${VERIFIERS_ABI} txVerifiers)`;
  get struct(): RuleStruct {
    return {
      key: this.key,
      signatureVerifiers: this.signatureVerifiers.map((v) => v.struct),
      txVerifiers: this.txVerifiers.map((v) => v.struct),
    };
  }

  get signatureVerifiers() {
    return this.verifiers.filter(isSignatureVerifier);
  }

  get txVerifiers() {
    return this.verifiers.filter(isTransactionVerifier);
  }

  static fromStruct(data: RuleStruct): Rule {
    const signatureVerifiers = data.signatureVerifiers.map(asSignatureVerifier);
    const txVerifiers = data.txVerifiers.map(asTransactionVerifier);

    return new Rule(data.key, [...signatureVerifiers, ...txVerifiers]);
  }

  // TODO: remove as unused
  get encoded() {
    return defaultAbiCoder.encode([Rule.ABI], [this.struct]);
  }

  get dataHash() {
    const { signatureVerifiers, txVerifiers } = this.struct;

    return ethers.utils.keccak256(
      defaultAbiCoder.encode([VERIFIERS_ABI, VERIFIERS_ABI], [signatureVerifiers, txVerifiers]),
    );
  }
}
