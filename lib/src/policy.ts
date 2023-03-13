import { defaultAbiCoder } from 'ethers/lib/utils';
import { SignatureLike } from '@ethersproject/bytes';
import { A } from 'ts-toolbelt';
import { isSignatureRule, isTransactionRule, Rule, RULES_ABI } from './rules/rule';
import { asSignatureRule, asTransactionRule } from './rules/uitl';
import { asUint32, BigIntLike, MAX_UINT32, MIN_UINT32 } from './uint';
import { ethers } from 'ethers';
import { PolicyStruct as BasePolicyStruct } from './contracts/Account';
import { AwaitedObj } from './util/types';
import { Address } from './addr';
import { GetDomainParams, hashTx, Tx } from './tx';
import { ClassSet } from './util/ClassSet';
import { match } from 'ts-pattern';

export type PolicyStruct = AwaitedObj<BasePolicyStruct>;

export type PolicyKey = A.Type<bigint, 'PolicyKey'>;
export const asPolicyKey = (key: BigIntLike) => asUint32(key) as unknown as PolicyKey;
export const MIN_POLICY_KEY = MIN_UINT32 as unknown as PolicyKey;
export const MAX_POLICY_KEY = MAX_UINT32 as unknown as PolicyKey;

export interface PolicyGuid {
  account: Address;
  key: PolicyKey;
}

export interface IsSatisfiedOptions {
  domainParams: GetDomainParams;
  tx: Tx;
  signatures: SignatureLike[];
}

export enum PolicySatisfiability {
  Unsatisifable = 'unsatisfiable',
  Satisfiable = 'satisfiable',
  Satisfied = 'satisfied',
}

export class Policy {
  public readonly key: PolicyKey;
  public rules: ClassSet<Rule>;

  constructor(key: BigIntLike, ...rules: Rule[]) {
    this.key = asPolicyKey(key);
    this.rules = new ClassSet(rules);
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

  async satisfiability({
    domainParams: { address, provider },
    tx,
    signatures,
  }: IsSatisfiedOptions): Promise<PolicySatisfiability> {
    const hash = await hashTx(tx, { address, provider });

    const sigRules = (
      await Promise.all(
        this.signatureRules.map((v) => v.isSatisfied({ provider, digest: hash, signatures })),
      )
    ).every((satisfied) => satisfied);

    const txRules = (
      await Promise.all(this.transactionRules.map((v) => v.isSatisfied({ provider, tx })))
    ).every((satisfied) => satisfied);

    return match({ sigRules, txRules })
      .with({ sigRules: true, txRules: true }, () => PolicySatisfiability.Satisfied)
      .with({ txRules: true }, () => PolicySatisfiability.Satisfiable)
      .otherwise(() => PolicySatisfiability.Unsatisifable);
  }
}
