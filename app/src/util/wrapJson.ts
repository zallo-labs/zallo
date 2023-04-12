export interface WrapJsonParams {
  trySerialize: (key: string, value: any) => unknown | undefined;
  tryDeserialize: (key: string, value: any) => unknown | undefined;
}

export const wrapJSON = ({ trySerialize, tryDeserialize }: WrapJsonParams): typeof JSON => ({
  stringify: (
    value: any,
    replacer?: ((this: any, key: string, value: any) => any) | (number | string)[] | null,
    space?: string | number,
  ): string => {
    if (Array.isArray(replacer)) throw new Error("Array replacer support isn't implemented");

    const wrappedReplacer = (key: string, value: any) => {
      const v = trySerialize(key, value);
      if (v !== undefined) value = v;

      return replacer ? replacer(key, value) : value;
    };
    return JSON.stringify(value, wrappedReplacer, space);
  },
  parse: (text: string, reviver?: (this: any, key: string, value: any) => any): any => {
    const wrappedReviver = (key: string, value: any) => {
      const v = tryDeserialize(key, value);
      if (v !== undefined) value = v;

      return reviver ? reviver(key, value) : value;
    };

    return JSON.parse(text, wrappedReviver);
  },
  [Symbol.toStringTag]: JSON[Symbol.toStringTag],
});
