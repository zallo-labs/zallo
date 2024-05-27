// Buffer; depends on react-native-quick-base64
import { Buffer } from '@craftzdog/react-native-buffer';
global.Buffer = Buffer as unknown as typeof global.Buffer;

import 'react-native-get-random-values';

// depends on react-native-get-random-values
import './crypto';

// Ethers - https://docs.ethers.org/v6/cookbook/react-native/
import { ethers } from 'ethers';
import crypto from 'crypto'; // Replaced by babel with correct pollyfill

ethers.randomBytes.register((length) => new Uint8Array(crypto.randomBytes(length)));
ethers.computeHmac.register((algo, key, data) =>
  crypto.createHmac(algo, key).update(data).digest(),
);
ethers.pbkdf2.register((passwd, salt, iter, keylen, algo) =>
  crypto.pbkdf2Sync(passwd, salt, iter, keylen, algo),
);
ethers.sha256.register((data) => crypto.createHash('sha256').update(data).digest());
ethers.sha512.register((data) => crypto.createHash('sha512').update(data).digest());

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
