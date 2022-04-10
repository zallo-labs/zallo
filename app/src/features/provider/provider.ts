// CRITICAL: Import in exactly this order - https://docs.ethers.io/v5/cookbook/react-native/
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import { LogBox, Platform } from 'react-native';

import { CONFIG } from '~/config';
import { CHAIN } from './chains';

export * from 'lib/typechain';

// Ethers uses long timers; these tasks WON'T be executed when the app is in the background but will resume once re-opened
if (Platform.OS !== 'web') LogBox.ignoreLogs(['Setting a timer']);

export const PROVIDER = ethers.getDefaultProvider(CHAIN.name, CONFIG.providers);
