import { defaultAbiCoder } from 'ethers/lib/utils';
import { Selector } from '../bytes';
import { Arraylike, toSet } from '../util/maybe';
import { asUint8 } from '../evmTypes';
import { RuleSelector } from './uitl';
import { TransactionRule, RuleStruct } from './rule';
import { tryOrIgnore } from '../util/try';

export class FunctionRule extends TransactionRule {
  constructor(public functions: Arraylike<Selector>) {
    super();
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

  static tryFromStruct(s: RuleStruct): FunctionRule | undefined {
    return tryOrIgnore(() => {
      if (s.selector === RuleSelector.Function) {
        return new FunctionRule(defaultAbiCoder.decode(['bytes4'], s.args)[0]);
      } else if (s.selector === RuleSelector.AnyOfFunctions) {
        return new FunctionRule(defaultAbiCoder.decode(['bytes4[]'], s.args)[0]);
      }
    });
  }
}
