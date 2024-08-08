// node-libs-react-native provides many shims
// Among those, which are overridden below: Buffer, atob, btoa
// import 'node-libs-react-native/globals'; // This is needed for atob for some reason, even though react-native-quick-base64 should override it

import './shared';

import '@walletconnect/react-native-compat';

// Intl pollyfills - required for iOS
import './intl';

global.process = require('process');
// @ts-expect-error Cannot assign to userAgent because it is a read-only property.
global.navigator.userAgent ??= 'React Native';

// Import corejs async iterator polyfill
import 'core-js/features/symbol/async-iterator'; // Required for neverthrow & viem

export default {};
