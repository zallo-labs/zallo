export const ERC1271_ABI = [
  {
    type: 'function',
    name: 'isValidSignature',
    inputs: [
      {
        name: '_data',
        type: 'bytes',
      },
      {
        name: '_signature',
        type: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'magicValue',
        type: 'bytes4',
      },
    ],
    constant: true,
    payable: false,
    stateMutability: 'view',
  },
] as const;
