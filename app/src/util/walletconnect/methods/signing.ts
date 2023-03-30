import { ethers } from 'ethers';
import { AccountIdlike } from '@api/account';
import BigIntJSON from '~/util/BigIntJSON';

export type SigningRequest = EthSignRequest | PersonalSignRequest | SignTypedDataRequest;

const WC_SIGNING_METHODS_ARRAY = [
  'personal_sign',
  'eth_sign',
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
  params: [account: AccountIdlike, message: string];
}

export interface PersonalSignRequest {
  method: 'personal_sign'; // message
  params: [message: string, account: AccountIdlike];
}

export interface SignTypedDataRequest {
  // https://eips.ethereum.org/EIPS/eip-712#specification-of-the-eth_signtypeddata-json-rpc
  method: 'eth_signTypedData' | 'eth_signTypedData_v3' | 'eth_signTypedData_v4';
  params: [account: AccountIdlike, typedDataJson: string];
}

export interface Eip712TypedDomainData<M = Record<string, unknown>, Type extends string = string> {
  domain: ethers.TypedDataDomain;
  types: Record<Type, ethers.TypedDataField[]>;
  primaryType: Type;
  message: M;
}

export const toTypedData = (typedDataJson: string): Eip712TypedDomainData => {
  const typedData = BigIntJSON.parse(typedDataJson) as Eip712TypedDomainData;

  // EIP712Domain is sent according to the RPC spec, but must not be passed into ethers
  // https://github.com/ethers-io/ethers.js/issues/687#issuecomment-714069471
  delete typedData.types['EIP712Domain'];

  return typedData;
};
