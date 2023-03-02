const toObj = <T extends string>(arr: readonly T[]): Record<T, T> =>
  arr.reduce((acc, key) => ({ ...acc, [key]: key }), {}) as Record<T, T>;

const ACCOUNT_ERRORS = [
  // Account
  'InsufficientBalance',
  'FailedToPayBootloader',
  'OnlyCallableByBootloader',
  // SelfOwned
  'OnlyCallableBySelf',
  // TransactionExectuor
  'TransactionAlreadyExecuted',
  // RuleManager
  'RuleConditionFailed',
  // ApproversVerifier
  'ApproverSignaturesMismatch',
  'InvalidApproverSignature',
  // MatchingFunctionVerifier
  'NotFunctionCall',
  'DidNotMatchFunction',
  'DidNotMatchAnyFunctions',
  // MatchingTargetVerifier
  'DidNotMatchTarget',
  'DidNotMatchAnyTarget',
] as const;

export const AccountError = toObj<(typeof ACCOUNT_ERRORS)[number]>(ACCOUNT_ERRORS);

const FACTORY_ERRORS = ['DeployFailed'] as const;

export const FactoryError = toObj<(typeof FACTORY_ERRORS)[number]>(FACTORY_ERRORS);
