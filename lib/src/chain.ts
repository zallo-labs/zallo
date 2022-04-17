export interface Chain {
  name: string;
  id: number;
}

export const MAINNET = {
  name: 'mainnet',
  id: 1,
} as const;

export const ROPSTEN = {
  name: 'ropsten',
  id: 3,
} as const;

export const CHAINS: Chain[] = [MAINNET, ROPSTEN];

export type ChainName = typeof CHAINS[number]['name'];

export const getChain = (name: string) => {
  const chain = CHAINS.find((c) => c.name === name.toLowerCase());
  if (!chain) throw new Error(`Invalid chain: ${name}`);

  return chain;
};
