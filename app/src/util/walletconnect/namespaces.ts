import { CHAIN_ID } from '@network/provider';
import { Address } from 'lib';
import { WC_METHODS } from './methods';

export const WC_NAMESPACE = 'eip155';

// https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md
// TODO: change CHAIN_ID back
// const toEip155Account = (account: Address) => `${WC_NAMESPACE}:${CHAIN_ID()}:${account}`;
const toEip155Account = (account: Address) => `${WC_NAMESPACE}:${5}:${account}`;

export const toNamespaces = (accounts: Address[]) => ({
  [WC_NAMESPACE]: {
    accounts: accounts.map(toEip155Account),
    methods: [...WC_METHODS],
    events: ['accountsChanged', 'chainChanged'],
  },
});
