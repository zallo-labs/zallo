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

export const CHAINS = [MAINNET, ROPSTEN] as const;

export type ChainName = typeof CHAINS[number]['name'];

export const CHAIN = ROPSTEN;
