const toObj = <T extends string>(arr: readonly T[]): Record<T, T> =>
  arr.reduce((acc, key) => ({ ...acc, [key]: key }), {}) as Record<T, T>;

const ACCOUNT_ERRORS = [
  // AccountProxy
  'NoInitializationDataProvided',
  // Account
  'InsufficientBalance',
  'FailedToPayBootloader',
  'OnlyCallableByBootloader',
  // SelfOwned
  'OnlyCallableBySelf',
  // Exectuor
  'TransactionReverted',
  'TransactionAlreadyExecuted',
  // PolicyManager
  'TooManyApprovers',
  'ThresholdTooLow',
  'ThresholdTooHigh',
  'PolicyDoesNotMatchExpectedHash',
  // ApprovalsVerifier
  'ThresholdNotReached',
  'InvalidSignature',
  // TransactionVerifier
  'UnknownPermission',
  // TargetPermission
  'NotToAnyOfTargets',
  'NotAnyOfTargetSelectors',
] as const;
export const AccountError = toObj<(typeof ACCOUNT_ERRORS)[number]>(ACCOUNT_ERRORS);

const ACCOUNT_PROXY_ERRORS = ['NoInitializationDataProvided'] as const;
export const AccountProxyError = toObj<(typeof ACCOUNT_PROXY_ERRORS)[number]>(ACCOUNT_PROXY_ERRORS);

const FACTORY_ERRORS = ['DeployFailed'] as const;
export const FactoryError = toObj<(typeof FACTORY_ERRORS)[number]>(FACTORY_ERRORS);
