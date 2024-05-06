import {
  Address,
  asMessageTypedData,
  asPolicy,
  asUAddress,
  encodeMessageSignature,
  encodePolicyStruct,
} from 'lib';
import { deploy, network, wallet } from './util';
import TestMessageValidator, { abi } from './contracts/TestMessageValidator';
import { TypedDataDefinition, hashMessage, hashTypedData } from 'viem';
import { CONFIG } from '../config';
import { expect } from 'chai';

const EIP1271_SUCCESS = '0x1626ba7e';

describe('MessageValidator', () => {
  const policy = asPolicy({ key: 1, approvers: [wallet.account.address] });
  let address: Address;

  before(async () => {
    address = (await deploy(TestMessageValidator)).address;
    await wallet.writeContract({
      address,
      abi,
      functionName: 'testAddPolicy',
      args: [encodePolicyStruct(policy)],
    });
  });

  it('validate personal message', async () => {
    const message = 'sign me up!';
    const hash = hashMessage(message);
    const messageTypedData = asMessageTypedData(asUAddress(address, CONFIG.chain.key), hash);
    const signature = encodeMessageSignature({
      message,
      policy,
      approvals: [
        {
          type: 'secp256k1',
          approver: wallet.account.address,
          signature: await wallet.signTypedData(messageTypedData),
        },
      ],
    });

    expect(
      network.readContract({
        address,
        abi,
        functionName: 'isValidSignature',
        args: [hash, signature],
      }),
    ).to.eventually.eq(EIP1271_SUCCESS);
  });

  it('validate typed data', async () => {
    const message: TypedDataDefinition = {
      types: {
        Example: [{ name: 'message', type: 'string' }],
      },
      primaryType: 'Example' as const,
      message: { message: 'sign me up!' },
    };
    const hash = hashTypedData(message);
    const messageTypedData = asMessageTypedData(asUAddress(address, CONFIG.chain.key), hash);
    const signature = encodeMessageSignature({
      message,
      policy,
      approvals: [
        {
          type: 'secp256k1',
          approver: wallet.account.address,
          signature: await wallet.signTypedData(messageTypedData),
        },
      ],
    });

    expect(
      network.readContract({
        address,
        abi,
        functionName: 'isValidSignature',
        args: [hash, signature],
      }),
    ).to.eventually.eq(EIP1271_SUCCESS);
  });
});
