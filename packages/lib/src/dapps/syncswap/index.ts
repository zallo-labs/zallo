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
    }),
  },
  vault: {
    abi: vaultAbi,
    address: addressMap({
      zksync: '0x621425a1Ef6abE91058E9712575dcc4258F8d091',
      'zksync-sepolia': '0xfd43b4DB521DA13490E79EB6CfbA19C9b012811c',
    }),
  },
  poolAbi: IPoolAbi,
  poolMaster: {
    abi: poolMasterAbi,
    address: addressMap({
      zksync: '0xbB05918E9B4bA9Fe2c8384d223f0844867909Ffb',
      'zksync-sepolia': '0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3',
    }),
  },
} as const;
