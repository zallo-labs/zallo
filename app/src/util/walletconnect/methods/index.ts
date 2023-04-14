import { WC_SIGNING_METHODS } from './signing';
import { WC_TRANSACTION_METHODS } from './transaction';

export const WC_METHODS = new Set([...WC_SIGNING_METHODS, ...WC_TRANSACTION_METHODS]);

export * from './signing';
export * from './transaction';
