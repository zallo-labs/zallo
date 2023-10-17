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
// import './ethersLogger';

// Immer features
import { enableMapSet } from 'immer';
enableMapSet();

// All resets, except those that break expo-router/drawer
import '@total-typescript/ts-reset/dist/fetch';
import '@total-typescript/ts-reset/dist/filter-boolean';
// import '@total-typescript/ts-reset/dist/is-array';
// import '@total-typescript/ts-reset/dist/json-parse';
import '@total-typescript/ts-reset/dist/array-includes';
import '@total-typescript/ts-reset/dist/set-has';
import '@total-typescript/ts-reset/dist/map-has';
import '@total-typescript/ts-reset/dist/array-index-of';

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
