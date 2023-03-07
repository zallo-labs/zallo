import { defaultAbiCoder } from 'ethers/lib/utils';
import { Selector } from '../bytes';
import { Arraylike, toSet } from '../util/maybe';
import { asUint8 } from '../evmTypes';
import { RuleSelector } from './uitl';
import { TransactionRule, RuleStruct } from './rule';
import { tryOrIgnore } from '../util/try';

export class TargetRule extends TransactionRule {
  constructor(public functions: Arraylike<Selector>) {
    super();
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
}
