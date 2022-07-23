import { ChainName } from './chain';

export const SAFE_IMPL: Partial<Record<ChainName, string>> = {
  testnet: '0xb2EB6D528f0021035CcD8073FE598C5100e4Cabe',
};

export const PROXY_FACTORY: Partial<Record<ChainName, string>> = {
  testnet: '0x925fC00b7305541A17CB77a5935cb29356cCE48A',
};

export const MULTICALL: Partial<Record<ChainName, string>> = {
  testnet: '0x398044dfEEabe3E0c72D7e739A362cD98294c25c',
};
