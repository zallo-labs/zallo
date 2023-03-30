const PATTERN = /^BigInt::([0-9]+)$/;
const toString = (value: bigint) => `BigInt::${value.toString()}`;

const stringify = (
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
): string => {
  const wrappedReplacer = (key: string, value: any) => {
    if (typeof value === 'bigint') value = toString(value);

    return replacer ? replacer(key, value) : value;
  };
  return JSON.stringify(value, wrappedReplacer, space);
};

const parse = (text: string, reviver?: (this: any, key: string, value: any) => any): any => {
  const wrappedReviver = (key: string, value: any) => {
    if (typeof value === 'string') {
      const matches = value.match(PATTERN);
      if (matches) value = BigInt(matches[1]!);
    }

    return reviver ? reviver(key, value) : value;
  };

  return JSON.parse(text, wrappedReviver);
};

export default { stringify, parse };
