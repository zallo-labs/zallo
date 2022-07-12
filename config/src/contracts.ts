import { ChainName } from './chain';

export const FACTORY: Partial<Record<ChainName, string>> = {
  testnet: '0x66712Fd70f384257a91228463F128C94ceBb490D',
};

export const MULTICALL: Partial<Record<ChainName, string>> = {
  testnet: '0x398044dfEEabe3E0c72D7e739A362cD98294c25c',
};
