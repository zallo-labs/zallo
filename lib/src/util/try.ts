export const tryOrCatch = <R, O>(f: () => R, otherwise: (e: unknown) => O): R | O => {
  try {
    return f();
  } catch (e) {
    return otherwise?.(e);
  }
};

export const tryOrCatchAsync = async <R, O>(
  f: () => R,
  otherwise: (e: unknown) => O,
): Promise<R | O> => {
  try {
    return await f();
  } catch (e) {
    return otherwise?.(e);
  }
};

export const tryOr = <R, O>(f: () => R, otherwise: O) => tryOrCatch(f, () => otherwise);

export const tryOrAsync = <R, O>(f: () => R, otherwise: O) => tryOrCatchAsync(f, () => otherwise);

export const tryOrIgnore = <R>(f: () => R) => tryOr(f, undefined);

export const tryOrIgnoreAsync = <R>(f: () => R) => tryOrAsync(f, undefined);
