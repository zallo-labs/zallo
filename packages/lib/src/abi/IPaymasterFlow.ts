export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "paymasterFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "discount",
            "type": "uint256"
          }
        ],
        "internalType": "struct PaymasterSignedData",
        "name": "paymasterData",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "yParityAndS",
            "type": "bytes32"
          }
        ],
        "internalType": "struct Secp256k1.Signature",
        "name": "paymasterSignature",
        "type": "tuple"
      }
    ],
    "name": "payForTransaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const bytecode = "0x" as const;

export const factoryDeps = {} as const;

export default { abi, bytecode, factoryDeps };
