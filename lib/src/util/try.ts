export const tryOr = async <R, O>(f: () => R, otherwise: (e: unknown) => O): Promise<R | O> => {
  try {
    return await f();
  } catch (e) {
    return await otherwise?.(e);
  }
};

export const tryOrDefault = <R, O>(f: () => R, otherwise: O): Promise<R | O> =>
  tryOr(f, () => otherwise);

export const tryOrIgnore = <R>(f: () => R): Promise<R | undefined> => tryOrDefault(f, undefined);
