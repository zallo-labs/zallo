export const SafeEvent = {
  Received: 'Received',
  Transaction: 'Transaction',
  TransactionReverted: 'TransactionReverted',
  MultiTransaction: 'MultiTransaction',
  GroupUpserted: 'GroupUpserted',
  GroupRemoved: 'GroupRemoved',
};

export const SafeError = {
  ExecutionReverted: 'ExecutionReverted',
  TxAlreadyExecuted: 'TxAlreadyExecuted',
  ApproversSignaturesLenMismatch: 'ApproversSignaturesLenMismatch',
  InvalidSignature: 'InvalidSignature',
  BelowThreshold: 'BelowThreshold',
  InvalidProof: 'InvalidProof',
  ApproverHashesNotAscending: 'ApproverHashesNotAscending',
  OnlyCallableBySafe: 'OnlyCallableBySafe',
};
