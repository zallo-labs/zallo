import { LogBox, Platform } from 'react-native';
import * as zk from 'zksync-web3';
import { CONFIG } from '~/util/config';
import { CHAINS, getChain } from 'lib';
import _ from 'lodash';

// Ethers uses long timers; these tasks WON'T be executed when the app is in the background but will resume once re-opened
if (Platform.OS !== 'web') LogBox.ignoreLogs(['Setting a timer']);

export const SUPPORTED_CHAINS = _.pick(CHAINS, ['testnet']);

export const CHAIN = getChain(CONFIG.chainName, SUPPORTED_CHAINS);
export const PROVIDER = new zk.Provider(CHAIN.rpc);
export const CHAIN_ID = () => PROVIDER?.network?.chainId ?? CHAINS.testnet.id;
