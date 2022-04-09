// CRITICAL: Import in exactly this order - https://docs.ethers.io/v5/cookbook/react-native/
import 'react-native-get-random-values';
import '@ethersproject/shims';
export * from 'ethers';
import { LogBox, Platform } from 'react-native';
export * from 'lib/typechain';

import { ethers } from 'ethers';
import { CONFIG } from '~/config';

// Ethers uses long timers; these tasks WON'T be executed when the app is in the background but will resume once re-opened
if (Platform.OS !== 'web') LogBox.ignoreLogs(['Setting a timer']);

export const PROVIDER = ethers.getDefaultProvider('ropsten', CONFIG.providers);

export const CHAIN_ID = 3; // Ropsten
