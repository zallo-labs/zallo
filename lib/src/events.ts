export const AccountEvent = {
  WalletUpserted: 'WalletUpserted',
  WalletRemoved: 'WalletRemoved',
  // TransactionExecutor
  Transaction: 'Transaction',
  TransactionReverted: 'TransactionReverted',
};

export const AccountError = {
  ApproverSignaturesMismatch: 'ApproverSignaturesMismatch',
  TxAlreadyExecuted: 'TxAlreadyExecuted',
  InvalidSignature: 'InvalidSignature',
  InvalidProof: 'InvalidProof',
  QuorumNotAscending: 'QuorumNotAscending',
  QuorumHashesNotAscending: 'QuorumHashesNotAscending',
  OnlyCallableByBootloader: 'OnlyCallableByBootloader',
  // SelfOwned
  OnlyCallableBySelf: 'OnlyCallableBySelf',
  // TransactionExecutor
  ExecutionReverted: 'ExecutionReverted',
  // Multicall
  CallReverted: 'CallReverted',
};
