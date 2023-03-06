import { defaultAbiCoder } from 'ethers/lib/utils';
import { Selector } from '../bytes';
import { Arraylike, toSet } from '../util/maybe';
import { asUint8 } from '../evmTypes';
import { InternalSelector } from './uitl';
import { TransactionVerifier, VerifierStruct } from './verifier';
import { tryOrIgnore } from '../util/try';

export class TargetVerifier extends TransactionVerifier {
  constructor(public functions: Arraylike<Selector>) {
    super();
  }

  get struct() {
    const functions = [...toSet(this.functions)];

    return functions.length === 1
      ? {
          selector: asUint8(InternalSelector.Target),
          args: defaultAbiCoder.encode(['address'], [functions]),
        }
      : {
          selector: asUint8(InternalSelector.AnyOfTargets),
          args: defaultAbiCoder.encode(['address[]'], [functions]),
        };
  }

  static tryFromStruct(s: VerifierStruct): TargetVerifier | undefined {
    return tryOrIgnore(() => {
      if (s.selector === InternalSelector.Target) {
        return new TargetVerifier(defaultAbiCoder.decode(['address'], s.args)[0]);
      } else if (s.selector === InternalSelector.AnyOfTargets) {
        return new TargetVerifier(defaultAbiCoder.decode(['address[]'], s.args)[0]);
      }
    });
  }
}
