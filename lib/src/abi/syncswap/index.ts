export * from './classicPool.abi';
export * from './classicPoolFactory.abi';
export * from './router.abi';
export * from './stablePool.abi';
export * from './stablePoolFactory.abi';
export * from './vault.abi';

// https://syncswap.gitbook.io/api-documentation/resources/smart-contract
export const SYNCSWAP_CONTRACTS = {
  vault: {
    mainnet: '0x621425a1Ef6abE91058E9712575dcc4258F8d091',
    testnet: '0x4Ff94F499E1E69D687f3C3cE2CE93E717a0769F8',
  },
  router: {
    mainnet: '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295',
    testnet: '0xB3b7fCbb8Db37bC6f572634299A58f51622A847e',
  },
  classicPoolFactory: {
    mainnet: '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb',
    testnet: '0xf2FD2bc2fBC12842aAb6FbB8b1159a6a83E72006',
  },
  stablePoolFactory: {
    mainnet: '0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3',
    testnet: '0xB6a70D6ab2dE494592546B696208aCEeC18D755f',
  },
} as const;
