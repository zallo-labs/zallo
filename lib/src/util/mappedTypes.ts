export type MaybePromise<T> = T | Promise<T>;

export type MaybeArray<T> = T | T[];

export const maybeToArray = <T>(maybe: MaybeArray<T>): T[] =>
  Array.isArray(maybe) ? maybe : [maybe];

const x = typeof '';
type TypeOf = typeof x;
type Checker = (e: unknown) => boolean;

export const createIsObj =
  <T extends object>(...fields: (keyof T | [keyof T, TypeOf | Checker])[]) =>
  (e: unknown): e is T =>
    typeof e === 'object' &&
    e !== null &&
    fields.every((field) => {
      if (Array.isArray(field)) {
        const [name, type] = field;
        if (!(name in e)) return false;

        return typeof type === 'function'
          ? type((e as T)[name])
          : typeof (e as T)[name] === type;
      } else {
        return field in e;
      }
    });
