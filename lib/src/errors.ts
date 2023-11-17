import { ACCOUNT } from './contract';
import { TestVerifier__factory } from './contracts';
import { isTruthy } from './util';

const PERMISSIONS_ABI = TestVerifier__factory.abi;

const toObj = <T extends string>(arr: readonly T[]): Record<T, T> =>
  arr.reduce((acc, key) => ({ ...acc, [key]: key }), {}) as Record<T, T>;

const errors = [...ACCOUNT.abi, ...PERMISSIONS_ABI]
  .map((t) => t.type === 'error' && t.name)
  .filter(isTruthy);
export const AccountError = toObj<(typeof errors)[number]>(errors);

const ACCOUNT_PROXY_ERRORS = ['NoInitializationDataProvided'] as const;
export const AccountProxyError = toObj<(typeof ACCOUNT_PROXY_ERRORS)[number]>(ACCOUNT_PROXY_ERRORS);

const FACTORY_ERRORS = ['DeployFailed'] as const;
export const FactoryError = toObj<(typeof FACTORY_ERRORS)[number]>(FACTORY_ERRORS);
