import { wrapJSON } from './wrapJson';

const PATTERN = /^BigInt::([0-9]+)$/;
const toString = (value: bigint) => `BigInt::${value}`;

export default wrapJSON({
  tryStringify(key) {
    // JSON calls toString() on the value before passing it to the replacer function
    // This results in 3n -> '3' by the time it reaches tryStringify due to our BigInt.toString() patch
    // this[key] always returns the original value so it is used over the value parameter
    const value = this[key];
    if (typeof value === 'bigint') return toString(value);
  },
  tryParse(_key, value) {
    if (typeof value === 'string') {
      const matches = value.match(PATTERN);
      if (matches) {
        try {
          return BigInt(matches[1]);
        } catch (e) {
          console.error(`Failed to convert from "${matches[1]}" to BigInt: ${e}"`);
        }
      }
    }
  },
});
