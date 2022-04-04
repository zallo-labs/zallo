// Required as filter((t?: T) => !!t) => (T | undefined); see https://github.com/microsoft/TypeScript/issues/20812
export const isPresent = <T>(t: T | undefined): t is T => !!t;

// https://stackoverflow.com/a/49725198
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
