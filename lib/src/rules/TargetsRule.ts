import { defaultAbiCoder } from 'ethers/lib/utils';
import { Arraylike, toSet } from '../util/maybe';
import { asUint8 } from '../uint';
import { RuleSelector } from './uitl';
import { TransactionRule, RuleStruct, TransactionRuleIsSatisfiedOptions } from './rule';
import { tryOrIgnore } from '../util/try';
import { Address } from '../addr';

export class TargetsRule extends TransactionRule {
  targets: Set<Address>;

  constructor(functions: Arraylike<Address>) {
    super();

    this.targets = toSet(functions);
    if (this.targets.size === 0) throw new Error('At least one function is required');
  }

  get struct() {
    const functions = [...toSet(this.targets)];

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

  static tryFromStruct(s: RuleStruct): TargetsRule | undefined {
    return tryOrIgnore(() => {
      if (s.selector === RuleSelector.Target) {
        return new TargetsRule(defaultAbiCoder.decode(['address'], s.args)[0]);
      } else if (s.selector === RuleSelector.AnyOfTargets) {
        return new TargetsRule(defaultAbiCoder.decode(['address[]'], s.args)[0]);
      }
    });
  }

  isSatisfied({ tx }: TransactionRuleIsSatisfiedOptions): boolean {
    return this.targets.has(tx.to);
  }
}
