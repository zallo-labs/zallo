import { AccountId } from '@api/account';
import { SUPPORTED_CHAINS } from '@network/provider';
import { Arraylike, toSet } from 'lib';
import { WC_METHODS } from './methods';

export const WC_NAMESPACE_KEY = 'eip155';

export const WC_SUPPORTED_CHAINS = Object.values(SUPPORTED_CHAINS).map(
  (chain) => `${WC_NAMESPACE_KEY}:${chain.id}`,
);

const WC_NAMESPACE = {
  chains: WC_SUPPORTED_CHAINS,
  methods: [...WC_METHODS],
  events: ['accountsChanged', 'chainChanged'],
};

export const toNamespaces = (accounts: Arraylike<AccountId>) => ({
  [WC_NAMESPACE_KEY]: {
    ...WC_NAMESPACE,
    // https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md
    accounts: [...toSet(accounts)].flatMap((account) =>
      WC_SUPPORTED_CHAINS.map((chain) => `${chain}:${account}`),
    ),
  },
});
