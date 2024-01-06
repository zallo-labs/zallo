import { match } from 'ts-pattern';
import { hexToString, TypedDataDefinition } from 'viem';

import { Addresslike, asAddress, isHex } from 'lib';

export type SigningRequest = PersonalSignRequest | SignTypedDataRequest;

const WC_SIGNING_METHODS_ARRAY = [
  // eth_sign is insecure and intentionally *not* supported
  'personal_sign',
  'eth_signTypedData', // v1
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
] as const;

export const WC_SIGNING_METHODS = new Set<string>(WC_SIGNING_METHODS_ARRAY);

// Assert that WC_SIGNING_METHODS contains all SigningRequest methods
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allMethodsHandled: (typeof WC_SIGNING_METHODS_ARRAY)[number] extends SigningRequest['method']
  ? true
  : false = true;

export interface EthSignRequest {
  // https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sign
  method: 'eth_sign'; // transaction
  params: [account: Addresslike, message: string];
}

export interface PersonalSignRequest {
  method: 'personal_sign'; // message
  params: [message: string, account: Addresslike];
}

export interface SignTypedDataRequest {
  // https://eips.ethereum.org/EIPS/eip-712#specification-of-the-eth_signtypeddata-json-rpc
  method: 'eth_signTypedData' | 'eth_signTypedData_v3' | 'eth_signTypedData_v4';
  params: [account: Addresslike, typedDataJson: string];
}

export const normalizeSigningRequest = (r: SigningRequest) =>
  match(r)
    .with(
      { method: 'personal_sign' },
      ({ params: [message, account] }) =>
        ({
          method: 'personal-sign',
          account: asAddress(account),
          message: isHex(message) ? hexToString(message) : message,
        }) as const,
    )
    .with(
      { method: 'eth_signTypedData' },
      { method: 'eth_signTypedData_v3' },
      { method: 'eth_signTypedData_v4' },
      ({ params: [account, typedDataJson] }) =>
        ({
          method: 'typed-data',
          account: asAddress(account),
          typedData: JSON.parse(typedDataJson) as TypedDataDefinition,
        }) as const,
    )
    .exhaustive();
