import { TypedData } from 'abitype';
import { Hex } from './bytes';
import { TypedDataDefinition } from 'viem';
import { getContractTypedDataDomain } from './util/typed-data';
import { UAddress } from './address';

const MESSAGE_EIP712_TYPES = {
  Message: [{ name: 'hash', type: 'bytes32' }],
} satisfies TypedData;

export function asMessageTypedData(account: UAddress, messageHash: Hex) {
  return {
    domain: getContractTypedDataDomain(account),
    types: MESSAGE_EIP712_TYPES,
    primaryType: 'Message' as const,
    message: { hash: messageHash },
  } satisfies TypedDataDefinition;
}
