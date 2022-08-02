export const SafeEvent = {
  AccountUpserted: 'AccountUpserted',
  AccountRemoved: 'AccountRemoved',
  // TransactionExecutor
  Transaction: 'Transaction',
  TransactionReverted: 'TransactionReverted',
};

export const SafeError = {
  ApproverSignaturesMismatch: 'ApproverSignaturesMismatch',
  TxAlreadyExecuted: 'TxAlreadyExecuted',
  InvalidSignature: 'InvalidSignature',
  InvalidProof: 'InvalidProof',
  QuorumNotAscending: 'QuorumNotAscending',
  QuorumHashesNotAscending: 'QuorumHashesNotAscending',
  OnlyCallableByBootloader: 'OnlyCallableByBootloader',
  // SelfOwned
  OnlyCallableBySafe: 'OnlyCallableBySafe',
  // TransactionExecutor
  ExecutionReverted: 'ExecutionReverted',
  // Multicall
  CallReverted: 'CallReverted',
};
