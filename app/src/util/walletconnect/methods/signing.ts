import { ethers } from 'ethers';
import { match } from 'ts-pattern';
import { Addresslike, asAddress, asHex } from 'lib';

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

export interface Eip712TypedDomainData<M = Record<string, unknown>, Type extends string = string> {
  domain: ethers.TypedDataDomain;
  types: Record<Type, ethers.TypedDataField[]>;
  primaryType: Type;
  message: M;
}

export const normalizeSigningRequest = (r: SigningRequest) =>
  match(r)
    .with({ method: 'personal_sign' }, ({ method, params: [message, account] }) => ({
      method,
      account: asAddress(account),
      message: asHex(message),
    }))
    .with({ method: 'eth_sign' }, ({ method, params: [account, message] }) => ({
      method,
      account: asAddress(account),
      message: asHex(message),
    }))
    .with(
      { method: 'eth_signTypedData' },
      { method: 'eth_signTypedData_v3' },
      { method: 'eth_signTypedData_v4' },
      ({ method, params: [account, typedDataJson] }) => ({
        method,
        account: asAddress(account),
        message: toTypedData(typedDataJson),
      }),
    )
    .exhaustive();

const toTypedData = (typedDataJson: string): Eip712TypedDomainData => {
  const typedData = JSON.parse(typedDataJson) as Eip712TypedDomainData;

  // EIP712Domain is sent according to the RPC spec, but must not be passed into ethers
  // https://github.com/ethers-io/ethers.js/issues/687#issuecomment-714069471
  delete typedData.types['EIP712Domain'];

  return typedData;
};

export const isTypedData = (v: unknown): v is Eip712TypedDomainData =>
  v !== null &&
  typeof v === 'object' &&
  'domain' in v &&
  'types' in v &&
  'primaryType' in v &&
  'message' in v;

export interface Eip712DataNode {
  type?: string;
  name?: string;
  children: Eip712DataNode[] | string;
}

export const isTypedDataNode = (v: unknown): v is Eip712DataNode =>
  v !== null && typeof v === 'object' && 'children' in v;

export const asTypedDataNode = (d: Eip712TypedDomainData): Eip712DataNode => {
  const getNode = (
    v: Record<string, unknown> | unknown,
    name: string | undefined,
    type: string,
  ): Eip712DataNode => {
    if (typeof v !== 'object' || v === null)
      return {
        name,
        type,
        children: typeof v === 'string' ? v : JSON.stringify(v),
      };

    const childrenTypes = d.types[type];

    return {
      name,
      type,
      children: Object.entries(v).map(([key, value]) =>
        getNode(value, key, childrenTypes.find((t) => t.name === key)!.type),
      ),
    };
  };

  return getNode(d.message, undefined, d.primaryType);
};
