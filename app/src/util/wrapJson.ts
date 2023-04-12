export interface WrapJsonParams {
  tryStringify: (key: string, value: any) => unknown | undefined;
  tryParse: (key: string, value: any) => unknown | undefined;
}

export const wrapJSON = ({ tryStringify, tryParse }: WrapJsonParams): typeof JSON => ({
  stringify: (value, replacer, space): string => {
    if (Array.isArray(replacer)) throw new Error("Array replacer support isn't implemented");

    const wrappedReplacer = (key: string, value: any) => {
      const v = tryStringify(key, value);
      if (v !== undefined) value = v;

      return replacer ? replacer(key, value) : value;
    };
    return JSON.stringify(value, wrappedReplacer, space);
  },
  parse: (text, reviver) => {
    const wrappedReviver = (key: string, value: any) => {
      const v = tryParse(key, value);
      if (v !== undefined) value = v;

      return reviver ? reviver(key, value) : value;
    };

    return JSON.parse(text, wrappedReviver);
  },
  [Symbol.toStringTag]: JSON[Symbol.toStringTag],
});
