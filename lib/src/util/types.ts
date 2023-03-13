import { A } from 'ts-toolbelt';

export type MaybePromise<T> = T | Promise<T>;

export type StrictType<T, Id extends string> = A.Type<T, Id>;

export type AwaitedObj<T> = {
  [K in keyof T]: T[K] extends Promise<infer U>
    ? U extends object
      ? AwaitedObj<U>
      : Awaited<U>
    : T[K] extends object
    ? AwaitedObj<T[K]>
    : Awaited<T[K]>;
};

type TupleSplit<T, N extends number, O extends readonly any[] = readonly []> = O['length'] extends N
  ? [O, T]
  : T extends readonly [infer F, ...infer R]
  ? TupleSplit<readonly [...R], N, readonly [...O, F]>
  : [O, T];

export type TakeFirst<T extends readonly unknown[], N extends number> = TupleSplit<T, N>[0];

export type SkipFirst<T extends readonly unknown[], N extends number = 1> = TupleSplit<T, N>[1];

export type TupleSlice<
  T extends readonly unknown[],
  S extends number,
  E extends number,
> = SkipFirst<TakeFirst<T, E>, S>;

export type OnlyRequiredItems<T extends any[], U extends any[] = []> = Partial<T> extends T
  ? U
  : T extends [infer F, ...infer R]
  ? OnlyRequiredItems<R, [...U, Awaited<F>]>
  : U;

export type PositiveInteger<T extends number> = number extends T
  ? never
  : `${T}` extends `-${string}` | `${string}.${string}`
  ? never
  : T;

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

        return typeof type === 'function' ? type((e as T)[name]) : typeof (e as T)[name] === type;
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

      return typeof checker === 'string' ? typeof value === checker : checker(value);
    });
  };
