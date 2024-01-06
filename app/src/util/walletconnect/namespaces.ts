import { Chain, ChainConfig, CHAINS } from 'chains';
import { Arraylike, asAddress, asChain, toSet, UAddress } from 'lib';
import { SUPPORTED_CHAINS } from '~/lib/network/chains';
import { WC_METHODS } from './methods';

export const WC_NAMESPACE_KEY = 'eip155';

// https://chainagnostic.org/CAIPs/caip-2
export const WC_SUPPORTED_CAIP2_CHAINS = Object.values(SUPPORTED_CHAINS).map(chainAsCaip2);

const WC_NAMESPACE = {
  chains: WC_SUPPORTED_CAIP2_CHAINS,
  methods: [...WC_METHODS],
  events: ['accountsChanged', 'chainChanged'],
};

export const toNamespaces = (accounts: Arraylike<UAddress>) => ({
  [WC_NAMESPACE_KEY]: {
    ...WC_NAMESPACE,
    // https://chainagnostic.org/CAIPs/caip-10
    accounts: [...toSet(accounts)].map(
      (account) => `${chainAsCaip2(CHAINS[asChain(account)])}:${asAddress(account)}`,
    ),
  },
});

const chainCaip2Mapping = Object.fromEntries(
  Object.values(SUPPORTED_CHAINS).map((c) => [chainAsCaip2(c), c.key] as const),
);

function chainAsCaip2(chain: ChainConfig) {
  return `${WC_NAMESPACE_KEY}:${chain.id}`;
}

export function caip2AsChain(caip2: string): Chain | undefined {
  return chainCaip2Mapping[caip2];
}
