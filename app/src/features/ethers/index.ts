// CRITICAL: Import in exactly this order - https://docs.ethers.io/v5/cookbook/react-native/
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import { CONFIG } from '../../config';
export * from 'ethers';

export * from 'lib/typechain';

export const PROVIDER = ethers.getDefaultProvider('rinkeby', CONFIG.providers);
