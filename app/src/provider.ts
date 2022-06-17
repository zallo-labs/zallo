// CRITICAL: Import in exactly this order - https://docs.ethers.io/v5/cookbook/react-native/
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import { LogBox, Platform } from 'react-native';
import * as zk from 'zksync-web3';

import { CONFIG } from '~/config';

// Ethers uses long timers; these tasks WON'T be executed when the app is in the background but will resume once re-opened
if (Platform.OS !== 'web') LogBox.ignoreLogs(['Setting a timer']);

export const CHAIN = CONFIG.chain;

export const PROVIDER = new zk.Provider(CHAIN.zksyncUrl);
export const ETH_PROVIDER = ethers.getDefaultProvider(CHAIN.ethUrl);
