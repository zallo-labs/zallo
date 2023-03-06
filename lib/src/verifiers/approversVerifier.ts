import { defaultAbiCoder } from 'ethers/lib/utils';
import { Address, compareAddress } from '../addr';
import { SignatureVerifier, VerifierStruct } from './verifier';
import { Arraylike, toSet } from '../util/maybe';
import { asUint8 } from '../evmTypes';
import { tryOrIgnore } from '../util/try';
import { InternalSelector } from './uitl';

export class ApproversVerifier extends SignatureVerifier {
  constructor(public approvers: Arraylike<Address>) {
    super();
  }

  get struct() {
    const approvers = [...toSet(this.approvers)].sort(compareAddress);

    return {
      selector: asUint8(InternalSelector.Approvers),
      args: defaultAbiCoder.encode(['address[]'], [approvers]),
    };
  }

  static tryFromStruct(s: VerifierStruct): ApproversVerifier | undefined {
    return tryOrIgnore(() => {
      if (s.selector !== InternalSelector.Approvers) return undefined;

      return new ApproversVerifier(defaultAbiCoder.decode(['address[]'], s.args)[0]);
    });
  }
}
