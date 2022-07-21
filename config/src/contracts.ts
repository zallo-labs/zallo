import { ChainName } from './chain';

export const SAFE_IMPL: Partial<Record<ChainName, string>> = {
  testnet: '0x6a895ab7DFD9B237A78Cfb27616104147C0F01C9',
};

export const PROXY_FACTORY: Partial<Record<ChainName, string>> = {
  testnet: '0x925fC00b7305541A17CB77a5935cb29356cCE48A',
};

export const MULTICALL: Partial<Record<ChainName, string>> = {
  testnet: '0x398044dfEEabe3E0c72D7e739A362cD98294c25c',
};
