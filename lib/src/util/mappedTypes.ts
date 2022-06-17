export type MaybePromise<T> = T | Promise<T>;

export type MaybeArray<T> = T | T[];

export const maybeToArray = <T>(maybe: MaybeArray<T>): T[] =>
  Array.isArray(maybe) ? maybe : [maybe];

export const createIsObj =
  <T>(...fields: (keyof T)[]) =>
  (e: unknown): e is T =>
    typeof e === 'object' && e !== null && fields.every((f) => f in e);
