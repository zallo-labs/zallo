export interface WrapJsonParams {
  tryStringify: (this: any, key: string, value: any) => unknown | undefined;
  tryParse: (this: any, key: string, value: any) => unknown | undefined;
}

export const wrapJSON = ({ tryStringify, tryParse }: WrapJsonParams): typeof JSON => ({
  stringify(value, replacer, space) {
    if (Array.isArray(replacer)) throw new Error("Array replacer support isn't implemented");

    function wrappedReplacer(this: any, key: string, value: any) {
      const v = tryStringify.call(this, key, value);
      if (v !== undefined) value = v;

      return replacer && !Array.isArray(replacer) ? replacer(key, value) : value;
    }
    return JSON.stringify(value, wrappedReplacer, space);
  },
  parse(text, reviver) {
    const wrappedReviver = (key: string, value: any) => {
      const v = tryParse.call(this, key, value);
      if (v !== undefined) value = v;

      return reviver ? reviver(key, value) : value;
    };

    return JSON.parse(text, wrappedReviver);
  },
  [Symbol.toStringTag]: JSON[Symbol.toStringTag],
});
