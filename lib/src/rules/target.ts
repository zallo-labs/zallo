import { defaultAbiCoder } from 'ethers/lib/utils';
import { Arraylike, toSet } from '../util/maybe';
import { asUint8 } from '../uint';
import { RuleSelector } from './uitl';
import { TransactionRule, RuleStruct, TransactionRuleIsSatisfiedOptions } from './rule';
import { tryOrIgnore } from '../util/try';
import { Address } from '../addr';

export class TargetRule extends TransactionRule {
  functions: Set<Address>;

  constructor(functions: Arraylike<Address>) {
    super();

    this.functions = toSet(functions);
    if (this.functions.size === 0) throw new Error('At least one function is required');
  }

  get struct() {
    const functions = [...toSet(this.functions)];

    return functions.length === 1
      ? {
          selector: asUint8(RuleSelector.Target),
          args: defaultAbiCoder.encode(['address'], [functions]),
        }
      : {
          selector: asUint8(RuleSelector.AnyOfTargets),
          args: defaultAbiCoder.encode(['address[]'], [functions]),
        };
  }

  static tryFromStruct(s: RuleStruct): TargetRule | undefined {
    return tryOrIgnore(() => {
      if (s.selector === RuleSelector.Target) {
        return new TargetRule(defaultAbiCoder.decode(['address'], s.args)[0]);
      } else if (s.selector === RuleSelector.AnyOfTargets) {
        return new TargetRule(defaultAbiCoder.decode(['address[]'], s.args)[0]);
      }
    });
  }

  isSatisfied({ tx }: TransactionRuleIsSatisfiedOptions): boolean {
    return this.functions.has(tx.to);
  }
}
