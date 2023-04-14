import 'node-libs-react-native/globals';
import { enableES5, enableMapSet } from 'immer';
import '~/util/network/provider'; // Contains ethers patches

export default {};

// Immer
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
