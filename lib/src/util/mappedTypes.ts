export type MaybePromise<T> = T | Promise<T>;

export type MaybeArray<T> = T | T[];

export const maybeToArray = <T>(maybe: MaybeArray<T>): T[] =>
  Array.isArray(maybe) ? maybe : [maybe];

const x = typeof '';
type TypeOf = typeof x;

export const createIsObj =
  <T extends object>(...fields: (keyof T | [keyof T, TypeOf])[]) =>
  (e: unknown): e is T =>
    typeof e === 'object' &&
    e !== null &&
    fields.every((field) => {
      if (Array.isArray(field)) {
        const [name, type] = field;
        return name in e && typeof (e as T)[name] === type;
      } else {
        return field in e;
      }
    });
