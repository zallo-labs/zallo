export type MaybePromise<T> = T | Promise<T>;

export const createIsObj =
  <T>(...fields: (keyof T)[]) =>
  (e: unknown): e is T =>
    typeof e === 'object' && e !== null && fields.every((f) => f in e);
