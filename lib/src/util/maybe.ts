export type Arraylike<T> = T | T[] | Set<T>;

export const toArray = <T>(values: NonNullable<T> | NonNullable<T>[]): NonNullable<T>[] =>
  Array.isArray(values) ? values : [values];

export const toSet = <T>(values: Arraylike<T>): Set<T> =>
  values instanceof Set ? values : new Set(Array.isArray(values) ? values : [values]);
