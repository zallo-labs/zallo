// node-libs-react-native provides many shims
// Among those, which are overridden below: Buffer, atob, btoa
// import 'node-libs-react-native/globals'; // This is needed for atob for some reason, even though react-native-quick-base64 should override it

global.process = require('process');

// @ts-expect-error Some modules expect userAgent to be a string
global.navigator.userAgent ??= 'React Native';

import './shared';

import '@walletconnect/react-native-compat';

// Intl pollyfills - required for iOS
import './intl';

import 'core-js/actual/url';
import 'core-js/actual/url-search-params'; // Required by URQL persisted-exchange

export default {};
