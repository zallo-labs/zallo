import { addressMap } from '../util';
import routerAbi from './router.abi';
import vaultAbi from './vault.abi';
import IPoolAbi from './IPool.abi';
import poolMasterAbi from './poolMaster.abi';

// https://syncswap.gitbook.io/api-documentation/resources/smart-contract
export const SYNCSWAP = {
  router: {
    abi: routerAbi,
    address: addressMap({
      zksync: '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295',
      'zksync-sepolia': '0x3f39129e54d2331926c1E4bf034e111cf471AA97',
      'zksync-goerli': '0xB3b7fCbb8Db37bC6f572634299A58f51622A847e',
    }),
  },
  vault: {
    abi: vaultAbi,
    address: addressMap({
      zksync: '0x621425a1Ef6abE91058E9712575dcc4258F8d091',
      'zksync-sepolia': '0xfd43b4DB521DA13490E79EB6CfbA19C9b012811c',
      'zksync-goerli': '0x4Ff94F499E1E69D687f3C3cE2CE93E717a0769F8',
    }),
  },
  poolAbi: IPoolAbi,
  poolMaster: {
    abi: poolMasterAbi,
    address: addressMap({
      zksync: '0xbB05918E9B4bA9Fe2c8384d223f0844867909Ffb',
      'zksync-sepolia': '0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3',
      'zksync-goerli': '0x22E50b84ec0C362427B617dB3e33914E91Bf865a',
    }),
  },
} as const;
