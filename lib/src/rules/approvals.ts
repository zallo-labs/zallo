import { defaultAbiCoder } from 'ethers/lib/utils';
import { Address, compareAddress } from '../addr';
import { SignatureRule, RuleStruct } from './rule';
import { Arraylike, toSet } from '../util/maybe';
import { asUint8 } from '../evmTypes';
import { tryOrIgnore } from '../util/try';
import { RuleSelector } from './uitl';

export class ApprovalsRule extends SignatureRule {
  constructor(public approvers: Arraylike<Address>) {
    super();
  }

  get struct() {
    const approvers = [...toSet(this.approvers)].sort(compareAddress);

    return {
      selector: asUint8(RuleSelector.Approvals),
      args: defaultAbiCoder.encode(['address[]'], [approvers]),
    };
  }

  static tryFromStruct(s: RuleStruct): ApprovalsRule | undefined {
    return tryOrIgnore(() => {
      if (s.selector !== RuleSelector.Approvals) return undefined;

      return new ApprovalsRule(defaultAbiCoder.decode(['address[]'], s.args)[0]);
    });
  }
}
