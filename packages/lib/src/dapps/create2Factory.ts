import { Address } from '../address';

const abi = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'bytecodeHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'input',
        type: 'bytes',
      },
    ],
    name: 'create2',
    outputs: [
      {
        internalType: 'address',
        name: 'newAddress',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'bytecodeHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'input',
        type: 'bytes',
      },
      {
        internalType: 'enum IContractDeployer.AccountAbstractionVersion',
        name: 'aaVersion',
        type: 'uint8',
      },
    ],
    name: 'create2Account',
    outputs: [
      {
        internalType: 'address',
        name: 'newAddress',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export const CREATE2_FACTORY = {
  address: '0x0000000000000000000000000000000000010000' as Address,
  abi,
};
