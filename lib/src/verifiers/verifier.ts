import { VerifierStruct as BaseVerifierStruct } from '../contracts/Account';
import { AwaitedObj } from '../util/mappedTypes';

export const VERIFIER_ABI = '(uint8 selector, bytes args)';
export const VERIFIERS_ABI = `${VERIFIER_ABI}[]`;

export type VerifierStruct = AwaitedObj<BaseVerifierStruct>;

export type Verifier = SignatureVerifier | TransactionVerifier;

export abstract class SignatureVerifier {
  abstract get struct(): VerifierStruct;
}

export const isSignatureVerifier = (v: unknown): v is SignatureVerifier =>
  v instanceof SignatureVerifier;

export abstract class TransactionVerifier {
  abstract get struct(): VerifierStruct;
}

export const isTransactionVerifier = (v: unknown): v is TransactionVerifier =>
  v instanceof TransactionVerifier;
