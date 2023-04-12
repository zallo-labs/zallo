import { wrapJSON } from './wrapJson';

const PATTERN = /^BigInt::([0-9]+)$/;
const toString = (value: bigint) => `BigInt::${value}`;

export default wrapJSON({
  trySerialize: (_key, value) => {
    if (typeof value === 'bigint') return toString(value);
  },
  tryDeserialize: (_key, value) => {
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
