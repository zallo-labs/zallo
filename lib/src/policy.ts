import { defaultAbiCoder } from 'ethers/lib/utils';
import { SignatureLike } from '@ethersproject/bytes';
import { A } from 'ts-toolbelt';
import { isSignatureRule, isTransactionRule, Rule, RULES_ABI } from './rules/rule';
import { asSignatureRule, asTransactionRule } from './rules/uitl';
import { asUint32, BigIntLike, MAX_UINT32, MIN_UINT32 } from './uint';
import { ethers } from 'ethers';
import { PolicyStruct as BasePolicyStruct } from './contracts/Account';
import { AwaitedObj } from './util/mappedTypes';
import { Address } from './addr';
import { GetDomainParams, hashTx, Tx } from './tx';
import { ClassMap } from './util/ClassMap';

export type PolicyStruct = AwaitedObj<BasePolicyStruct>;

export type PolicyKey = A.Type<bigint, 'PolicyKey'>;
export const asPolicyKey = (key: BigIntLike) => asUint32(key) as unknown as PolicyKey;
export const MIN_POLICY_KEY = MIN_UINT32 as unknown as PolicyKey;
export const MAX_POLICY_KEY = MAX_UINT32 as unknown as PolicyKey;

export interface PolicyGuid {
  account: Address;
  key: PolicyKey;
}

export type OnlySatisfied = 'signature' | 'transaction';

export interface IsSatisfiedOptions {
  domainParams: GetDomainParams;
  tx: Tx;
  signatures: SignatureLike[];
  only?: OnlySatisfied;
}

export class Policy {
  public readonly key: PolicyKey;
  public rules: ClassMap<Rule>;

  constructor(key: BigIntLike, ...rules: Rule[]) {
    this.key = asPolicyKey(key);
    this.rules = new ClassMap(...rules);
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
    return [...this.rules].filter(isSignatureRule);
  }

  get transactionRules() {
    return [...this.rules].filter(isTransactionRule);
  }

  static fromStruct(data: PolicyStruct): Policy {
    const signatureVerifiers = data.signatureRules.map(asSignatureRule);
    const txVerifiers = data.transactionRules.map(asTransactionRule);

    return new Policy(data.key, ...signatureVerifiers, ...txVerifiers);
  }

  get hash() {
    const { signatureRules, transactionRules } = this.struct;

    return ethers.utils.keccak256(
      defaultAbiCoder.encode([RULES_ABI, RULES_ABI], [signatureRules, transactionRules]),
    );
  }

  async isSatisfied({
    domainParams: { address, provider },
    tx,
    signatures,
    only,
  }: IsSatisfiedOptions): Promise<boolean> {
    const hash = await hashTx(tx, { address, provider });

    return (
      await Promise.all([
        ...(!only || only === 'signature' ? this.signatureRules : []).map((v) =>
          v.isSatisfied({ provider, digest: hash, signatures }),
        ),
        ...(!only || only === 'transaction' ? this.transactionRules : []).map((v) =>
          v.isSatisfied({ provider, tx }),
        ),
      ])
    ).every((isValid) => isValid);
  }
}
