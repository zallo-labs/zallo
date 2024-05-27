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
        "name": "minAllowance",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "arbitraryInput",
        "type": "bytes"
      }
    ],
    "name": "approvalBased",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxAmount",
        "type": "uint256"
      }
    ],
    "name": "approvalBasedWithMax",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "input",
        "type": "bytes"
      }
    ],
    "name": "general",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const bytecode = "0x" as const;

export const factoryDeps = {} as const;

export default { abi, bytecode, factoryDeps };
