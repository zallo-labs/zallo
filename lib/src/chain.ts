export type ChainName = 'mainnet' | 'ropsten' | 'localhost';

export interface Chain {
  name: ChainName;
  id: number;
  url?: string;
}

export const CHAINS: Record<ChainName, Chain> = {
  mainnet: {
    name: 'mainnet',
    id: 1,
  },
  ropsten: {
    name: 'ropsten',
    id: 3,
  },
  localhost: {
    name: 'localhost',
    id: 31337,
    url: `http://192.168.1.243:8545`,
  },
};

export const getChain = (name: string) => {
  const chain = CHAINS[name.toLowerCase() as ChainName];
  if (!chain) throw new Error(`Chain not supported: ${name}`);

  return chain;
};
