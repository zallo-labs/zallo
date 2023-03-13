export type Arraylike<T> = T | T[] | Set<T>;

export const toArray = <T>(values: Arraylike<T>): T[] =>
  Array.isArray(values) ? values : values instanceof Set ? [...values] : [values];

export const toSet = <T>(values: Arraylike<T>): Set<T> =>
  values instanceof Set ? values : new Set(Array.isArray(values) ? values : [values]);
