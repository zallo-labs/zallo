// node-libs-react-native provides many shims
// Among those, which are overridden below: Buffer, atob, btoa
import 'node-libs-react-native/globals'; // This is needed for atob for some reason, even though react-native-quick-base64 should override it

import './shared';

// Provides fallback shims for missing features
// Crypto needs to be shimmed before this - https://docs.ethers.org/v5/cookbook/react-native/
import '@ethersproject/shims';

import '@walletconnect/react-native-compat';

// Intl pollyfills - required for iOS
import './intl';

import 'core-js/actual/url';
import 'core-js/actual/url-search-params'; // Required by URQL persisted-exchange

import '@total-typescript/ts-reset';

export default {};
