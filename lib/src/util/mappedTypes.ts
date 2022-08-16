export type MaybePromise<T> = T | Promise<T>;

export type MaybeArray<T> = T | T[];

export const maybeToArray = <T>(maybe: MaybeArray<T>): T[] =>
  Array.isArray(maybe) ? maybe : [maybe];

const x = typeof '';
type Checker = typeof x | ((e: unknown) => boolean);

export const createIsObj =
  <T extends object>(...fields: (keyof T | [keyof T, Checker])[]) =>
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

type Schema<T> = Record<keyof T, Checker>;

export const createIs =
  <T>(schema: Schema<T>) =>
  (obj: unknown): obj is T => {
    if (typeof obj !== 'object' || obj === null) return false;

    return Object.entries(schema).every((entry) => {
      const [key, checker] = entry as [keyof T, Checker];
      const value = (obj as unknown as T)[key];

      return typeof checker === 'string'
        ? typeof value === checker
        : checker(value);
    });
  };
