import { defaultAbiCoder } from 'ethers/lib/utils';
import { asSelector, Selector } from '../bytes';
import { Arraylike, toSet } from '../util/maybe';
import { asUint8 } from '../bigint';
import { RuleSelector } from './RuleSelector';
import { TransactionRule, RuleStruct, TransactionRuleIsSatisfiedOptions } from './rule';
import { tryOrIgnore } from '../util/try';

export class FunctionsRule extends TransactionRule {
  functions: Set<Selector>;

  constructor(functions: Arraylike<Selector>) {
    super();

    this.functions = toSet(functions);
    if (this.functions.size === 0) throw new Error('At least one function is required');
  }

  get struct() {
    const functions = [...toSet(this.functions)];

    return functions.length === 1
      ? {
          selector: asUint8(RuleSelector.Function),
          args: defaultAbiCoder.encode(['bytes4'], [functions]),
        }
      : {
          selector: asUint8(RuleSelector.AnyOfFunctions),
          args: defaultAbiCoder.encode(['bytes4[]'], [functions]),
        };
  }

  static tryFromStruct(s: RuleStruct): FunctionsRule | undefined {
    return tryOrIgnore(() => {
      if (s.selector === RuleSelector.Function) {
        return new FunctionsRule(defaultAbiCoder.decode(['bytes4'], s.args)[0]);
      } else if (s.selector === RuleSelector.AnyOfFunctions) {
        return new FunctionsRule(defaultAbiCoder.decode(['bytes4[]'], s.args)[0]);
      }
    });
  }

  isSatisfied({ tx }: TransactionRuleIsSatisfiedOptions): boolean {
    return tx.data !== undefined && this.functions.has(asSelector(tx.data));
  }
}
