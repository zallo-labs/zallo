import { ACCOUNT_ABI, PERMISSIONS_ABI } from './abi';
import { isTruthy } from './util';

const toObj = <T extends string>(arr: readonly T[]): Record<T, T> =>
  arr.reduce((acc, key) => ({ ...acc, [key]: key }), {}) as Record<T, T>;

const errors = [...ACCOUNT_ABI, ...PERMISSIONS_ABI]
  .map((t) => t.type === 'error' && t.name)
  .filter(isTruthy);
export const AccountError = toObj<(typeof errors)[number]>(errors);

const ACCOUNT_PROXY_ERRORS = ['NoInitializationDataProvided'] as const;
export const AccountProxyError = toObj<(typeof ACCOUNT_PROXY_ERRORS)[number]>(ACCOUNT_PROXY_ERRORS);

const FACTORY_ERRORS = ['DeployFailed'] as const;
export const FactoryError = toObj<(typeof FACTORY_ERRORS)[number]>(FACTORY_ERRORS);
