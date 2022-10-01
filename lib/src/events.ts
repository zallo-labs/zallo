export const AccountEvent = {
  UserUpserted: 'UserUpserted',
  UserRemoved: 'UserRemoved',
  // TransactionExecutor
  Transaction: 'Transaction',
  TransactionReverted: 'TransactionReverted',
};

export const AccountError = {
  ApproverSignaturesMismatch: 'ApproverSignaturesMismatch',
  TxAlreadyExecuted: 'TxAlreadyExecuted',
  InvalidSignature: 'InvalidSignature',
  InvalidProof: 'InvalidProof',
  OnlyCallableByBootloader: 'OnlyCallableByBootloader',
  // SelfOwned
  OnlyCallableBySelf: 'OnlyCallableBySelf',
  // TransactionExecutor
  ExecutionReverted: 'ExecutionReverted',
  // UserHelper
  NoUserConfigs: 'NoUserConfigs',
  UserConfigHashesNotAscending: 'UserConfigHashesNotAscending',
  // Multicall
  CallReverted: 'CallReverted',
};
