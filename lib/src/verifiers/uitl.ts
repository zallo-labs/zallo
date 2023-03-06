import { VerifierStruct as BaseVerifierStruct } from '../contracts/Account';
import { isPresent } from '../util/arrays';
import { VerifierStruct, SignatureVerifier, TransactionVerifier } from './verifier';
import { ApproversVerifier } from './approversVerifier';
import { FunctionVerifier } from './functionVerifier';
import { TargetVerifier } from './targetVerifier';
import { Tx } from '../tx';

export enum InternalSelector {
  Approvers,
  Function,
  AnyOfFunctions,
  Target,
  AnyOfTargets,
}

export const asSignatureVerifier = (data: VerifierStruct): SignatureVerifier =>
  fromStruct<SignatureVerifier>(data, [ApproversVerifier.tryFromStruct]);

export const asTransactionVerifier = (data: VerifierStruct): TransactionVerifier =>
  fromStruct<TransactionVerifier>(data, [
    FunctionVerifier.tryFromStruct,
    TargetVerifier.tryFromStruct,
  ]);

const fromStruct = <T>(
  data: VerifierStruct,
  verifiersTryFromStruct: ((data: VerifierStruct) => T | undefined)[],
): T => {
  const verifiers = verifiersTryFromStruct
    .map((tryFromStruct) => tryFromStruct(data))
    .filter(isPresent);

  if (verifiers.length === 0) throw new Error(`Invalid VerifierStruct: ${data}`);
  if (verifiers.length > 1) throw new Error(`Ambiguous VerifierStruct: ${data}`);

  return verifiers[0];
};
