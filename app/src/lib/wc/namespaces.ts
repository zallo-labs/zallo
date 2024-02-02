import { UAddress, asAddress, asChain, asUAddress } from 'lib';
import { WC_METHODS } from './methods';
import { CHAINS, Chain, ChainConfig } from 'chains';
import { BuildApprovedNamespacesParams } from '@walletconnect/utils';
import { SessionTypes } from '@walletconnect/types';

export const WC_NAMESPACE = 'eip155';

export function supportedNamespaces(
  accounts: UAddress[],
): BuildApprovedNamespacesParams['supportedNamespaces'] {
  return {
    [WC_NAMESPACE]: {
      methods: [...WC_METHODS],
      events: ['accountsChanged', 'chainChanged'],
      ...accountNamespaces(accounts),
    },
  };
}

export function updateNamespaces(namepsaces: SessionTypes.Namespaces, accounts: UAddress[]) {
  return {
    ...namepsaces,
    [WC_NAMESPACE]: {
      ...namepsaces[WC_NAMESPACE],
      ...accountNamespaces(accounts),
    },
  };
}

function accountNamespaces(accounts: UAddress[]) {
  return {
    accounts: accounts.map(asCaip10),
    chains: [...new Set(accounts.map((a) => asCaip2(CHAINS[asChain(a)])))], // Only accepts chains with an account
  };
}

// https://chainagnostic.org/CAIPs/caip-2
export function asCaip2(chain: ChainConfig) {
  return `${WC_NAMESPACE}:${chain.id}` as const;
}

const CAIP2_REGEX = new RegExp(`^${WC_NAMESPACE}:([0-9]+)`);
export function fromCaip2(caip2: string): Chain | undefined {
  const id = caip2.match(CAIP2_REGEX)?.[1];
  if (!id) return undefined;

  return Object.values(CHAINS).find((c) => c.id === parseInt(id))?.key;
}

// https://chainagnostic.org/CAIPs/caip-10
export function asCaip10(address: UAddress) {
  return `${asCaip2(CHAINS[asChain(address)])}:${asAddress(address)}`;
}

export function fromCaip10(caip10: string): UAddress | undefined {
  const addressSep = caip10.lastIndexOf(':');
  const chain = fromCaip2(caip10.slice(0, addressSep));
  if (!chain) return undefined;

  return asUAddress(caip10.slice(addressSep + 1), chain);
}

export function sessionChains(
  session: Pick<SessionTypes.Struct, 'requiredNamespaces' | 'optionalNamespaces'> | undefined,
) {
  return [
    ...(session?.requiredNamespaces[WC_NAMESPACE]?.chains ?? []),
    ...(session?.optionalNamespaces[WC_NAMESPACE]?.chains ?? []),
  ]
    .map(fromCaip2)
    .filter(Boolean);
}
