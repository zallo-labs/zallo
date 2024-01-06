import { addressMap } from '../util';
import classPoolFactoryAbi from './classicPoolFactory.abi';
import IPoolAbi from './IPool.abi';
import poolMasterAbi from './poolMaster.abi';
import routerAbi from './router.abi';
import stablePoolFactoryAbi from './stablePoolFactory.abi';
import vaultAbi from './vault.abi';

// https://syncswap.gitbook.io/api-documentation/resources/smart-contract
export const SYNCSWAP = {
  router: {
    abi: routerAbi,
    address: addressMap({
      zksync: '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295',
      'zksync-goerli': '0xB3b7fCbb8Db37bC6f572634299A58f51622A847e',
    }),
  },
  vault: {
    abi: vaultAbi,
    address: addressMap({
      zksync: '0x621425a1Ef6abE91058E9712575dcc4258F8d091',
      'zksync-goerli': '0x4Ff94F499E1E69D687f3C3cE2CE93E717a0769F8',
    }),
  },
  poolAbi: IPoolAbi,
  classicPool: {
    abi: IPoolAbi,
    factory: {
      abi: classPoolFactoryAbi,
      address: addressMap({
        zksync: '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb',
        'zksync-goerli': '0xf2FD2bc2fBC12842aAb6FbB8b1159a6a83E72006',
      }),
    },
  },
  stablePool: {
    abi: IPoolAbi,
    factory: {
      abi: stablePoolFactoryAbi,
      address: addressMap({
        zksync: '0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3',
        'zksync-goerli': '0xB6a70D6ab2dE494592546B696208aCEeC18D755f',
      }),
    },
  },
  poolMaster: {
    abi: poolMasterAbi,
    address: addressMap({
      zksync: '0xbB05918E9B4bA9Fe2c8384d223f0844867909Ffb',
      'zksync-goerli': '0x22E50b84ec0C362427B617dB3e33914E91Bf865a',
    }),
  },
} as const;
