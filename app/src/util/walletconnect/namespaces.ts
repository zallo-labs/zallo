import { AccountId } from '@api/account';
import { CHAIN_ID } from '@network/provider';
import { Arraylike, toSet } from 'lib';
import { WC_METHODS } from './methods';

export const WC_NAMESPACE = 'eip155';

// https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md
const toEip155Account = (account: AccountId) => `${WC_NAMESPACE}:${CHAIN_ID()}:${account}`;

export const toNamespaces = (accounts: Arraylike<AccountId>) => ({
  [WC_NAMESPACE]: {
    accounts: [...toSet(accounts)].map(toEip155Account),
    methods: [...WC_METHODS],
    events: ['accountsChanged', 'chainChanged'],
  },
});
