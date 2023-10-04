// Base64 (atob, btoa)
import { atob, btoa } from 'react-native-quick-base64';
global.atob = atob;
global.btoa = btoa;

// Buffer; depends on react-native-quick-base64
import { Buffer } from '@craftzdog/react-native-buffer';
global.Buffer = Buffer as unknown as typeof global.Buffer;

import 'react-native-get-random-values';

// depends on react-native-get-random-values
import './crypto';

// Log ethers events
import './ethersLogger';

// Immer features
import { enableMapSet } from 'immer';
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
