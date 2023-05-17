// node-libs-react-native provides many shims
// Among those, which are overridden below: Buffer, atob, btoa
import 'node-libs-react-native/globals';

// Buffer
import { Buffer } from '@craftzdog/react-native-buffer';
global.Buffer = Buffer as any;

// Crypto
import 'react-native-quick-crypto'; // crypto

// Base64 (atob, btoa)
import { shim } from 'react-native-quick-base64';
shim();

// Provides fallback shims for missing features
// Crypto needs to be shimmed before this - https://docs.ethers.org/v5/cookbook/react-native/
import '@ethersproject/shims';

// Log ethers events
import './ethersLogger';

// Intl pollyfills - required for iOS
import './intl';

// Immer features
import { enableES5, enableMapSet } from 'immer';
enableES5();
enableMapSet();

// BigInt
declare global {
  interface BigInt {
    toJSON: () => string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default {};
