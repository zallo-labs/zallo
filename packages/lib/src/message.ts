import { Hex, asHex } from './bytes';
import { TypedDataDefinition, concat, encodeAbiParameters, stringToHex } from 'viem';
import { getContractTypedDataDomain } from './util/typed-data';
import { UAddress } from './address';
import { POLICY_STRUCT_ABI, Policy, encodePolicyStruct } from './policy';
import { APPROVALS_ABI, Approval, encodeApprovalsStruct } from './approvals';
import { ethers } from 'ethers';
import { WritableDeep } from 'ts-toolbelt/out/Object/Writable';
import { isPresent } from './util';
import _ from 'lodash';

export function asMessageTypedData(account: UAddress, messageHash: Hex) {
  return {
    domain: getContractTypedDataDomain(account),
    types: {
      Message: [{ name: 'hash', type: 'bytes32' }],
    },
    primaryType: 'Message' as const,
    message: { hash: messageHash },
  } satisfies TypedDataDefinition;
}

export interface EncodeMessageSignature {
  message: string | TypedDataDefinition;
  policy: Policy;
  approvals: Approval[];
}

export function encodeMessageSignature({ message, policy, approvals }: EncodeMessageSignature) {
  const encodedMessage =
    typeof message === 'string' ? stringToHex(message) : typedDataToHex(message);

  return encodeAbiParameters(
    [{ type: 'bytes', name: 'message' }, POLICY_STRUCT_ABI, APPROVALS_ABI],
    [
      encodedMessage,
      encodePolicyStruct(policy),
      encodeApprovalsStruct({ approvals, approvers: policy.approvers }),
    ],
  );
}

export function typedDataToHex(typedData: TypedDataDefinition): Hex {
  return asHex(
    concat(
      (
        [
          '0x1901',
          typedData.domain && ethers.TypedDataEncoder.hashDomain(typedData.domain),
          ethers.TypedDataEncoder.from(
            _.omit(typedData.types as WritableDeep<typeof typedData.types>, 'EIP712Domain'),
          ).hash(typedData.message),
        ] as Hex[]
      ).filter(isPresent),
    ),
  );
}
