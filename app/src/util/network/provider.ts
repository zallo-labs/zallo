import { LogBox, Platform } from 'react-native';
import * as zk from 'zksync-web3';
import { CONFIG } from '~/util/config';
import { CHAINS, getChain, getEthersConnectionParams } from 'lib';
import _ from 'lodash';
import { createPublicClient, http } from 'viem';

// Ethers uses long timers; these tasks WON'T be executed when the app is in the background but will resume once re-opened
if (Platform.OS !== 'web') LogBox.ignoreLogs(['Setting a timer']);

export const SUPPORTED_CHAINS = _.pick(CHAINS, ['testnet']);
export const CHAIN = getChain(CONFIG.chainName, SUPPORTED_CHAINS);

export const PROVIDER = new zk.Provider(...getEthersConnectionParams(CHAIN, 'http'));

export const VIEM_CLIENT = createPublicClient({
  chain: CHAIN,
  transport: http(),
});
