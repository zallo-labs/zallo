import { defaultAbiCoder } from 'ethers/lib/utils';
import { Selector } from '../bytes';
import { Arraylike, toSet } from '../util/maybe';
import { asUint8 } from '../evmTypes';
import { InternalSelector } from './uitl';
import { TransactionVerifier, VerifierStruct } from './verifier';
import { tryOrIgnore } from '../util/try';

export class FunctionVerifier extends TransactionVerifier {
  constructor(public functions: Arraylike<Selector>) {
    super();
  }

  get struct() {
    const functions = [...toSet(this.functions)];

    return functions.length === 1
      ? {
          selector: asUint8(InternalSelector.Function),
          args: defaultAbiCoder.encode(['bytes4'], [functions]),
        }
      : {
          selector: asUint8(InternalSelector.AnyOfFunctions),
          args: defaultAbiCoder.encode(['bytes4[]'], [functions]),
        };
  }

  static tryFromStruct(s: VerifierStruct): FunctionVerifier | undefined {
    return tryOrIgnore(() => {
      if (s.selector === InternalSelector.Function) {
        return new FunctionVerifier(defaultAbiCoder.decode(['bytes4'], s.args)[0]);
      } else if (s.selector === InternalSelector.AnyOfFunctions) {
        return new FunctionVerifier(defaultAbiCoder.decode(['bytes4[]'], s.args)[0]);
      }
    });
  }
}
