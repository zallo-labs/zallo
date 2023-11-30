import { SUPPORTED_CHAINS } from '~/lib/network/chains';
import { UAddress, Arraylike, toSet, asAddress, asChain } from 'lib';
import { WC_METHODS } from './methods';
import { CHAINS, Chain, ChainConfig } from 'chains';

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
