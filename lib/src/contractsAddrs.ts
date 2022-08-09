import { ChainName } from './chain';

export const ACCOUNT_IMPL_ADDRS: Partial<Record<ChainName, string>> = {
  testnet: '0xEBfD7a9e989994cDfCEe93d5EDe3f282bEf14529',
};

export const PROXY_FACTORY_ADDRS: Partial<Record<ChainName, string>> = {
  testnet: '0x925fC00b7305541A17CB77a5935cb29356cCE48A',
};

export const MULTICALL_ADDRS: Partial<Record<ChainName, string>> = {
  testnet: '0x398044dfEEabe3E0c72D7e739A362cD98294c25c',
};
