export const abi = [
  {
    "inputs": [
      {
        "components": [
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
            "internalType": "struct K256.Signature[]",
            "name": "k256",
            "type": "tuple[]"
          },
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "approverIndex",
                "type": "uint16"
              },
              {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
              }
            ],
            "internalType": "struct ERC1271Approval[]",
            "name": "erc1271",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct Approvals",
        "name": "",
        "type": "tuple"
      }
    ],
    "name": "Approvals_",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint32",
            "name": "delay",
            "type": "uint32"
          }
        ],
        "internalType": "struct DelayConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "name": "DelayHook",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint96",
            "name": "value",
            "type": "uint96"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Operation",
        "name": "",
        "type": "tuple"
      }
    ],
    "name": "Operation_",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint96",
            "name": "value",
            "type": "uint96"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Operation[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "name": "Operations",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "allow",
            "type": "bool"
          }
        ],
        "internalType": "struct OtherMessageConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "name": "OtherMessageHook",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "addr",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "allow",
                "type": "bool"
              },
              {
                "internalType": "bytes4[]",
                "name": "excludedSelectors",
                "type": "bytes4[]"
              }
            ],
            "internalType": "struct ContractConfig[]",
            "name": "contracts",
            "type": "tuple[]"
          },
          {
            "internalType": "bool",
            "name": "defaultAllow",
            "type": "bool"
          },
          {
            "internalType": "bytes4[]",
            "name": "defaultExcludedSelectors",
            "type": "bytes4[]"
          }
        ],
        "internalType": "struct TargetsConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "name": "TargetHook",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint224",
                "name": "amount",
                "type": "uint224"
              },
              {
                "internalType": "uint32",
                "name": "duration",
                "type": "uint32"
              }
            ],
            "internalType": "struct TransferLimit[]",
            "name": "limits",
            "type": "tuple[]"
          },
          {
            "internalType": "bool",
            "name": "defaultAllow",
            "type": "bool"
          },
          {
            "internalType": "Budget",
            "name": "budget",
            "type": "uint32"
          }
        ],
        "internalType": "struct TransfersConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "name": "TransferHook",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint96",
                "name": "value",
                "type": "uint96"
              },
              {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
              }
            ],
            "internalType": "struct Operation[]",
            "name": "operations",
            "type": "tuple[]"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "paymaster",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "paymasterSignedInput",
            "type": "bytes"
          }
        ],
        "internalType": "struct Tx",
        "name": "",
        "type": "tuple"
      }
    ],
    "name": "Tx_",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  }
] as const;

export const bytecode = "0x" as const;

export const factoryDeps = {} as const;

export default { abi, bytecode, factoryDeps };
