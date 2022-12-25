export const tryOr = <R, O>(f: () => R, otherwise: (e: unknown) => O): R | O => {
  try {
    return f();
  } catch (e) {
    return otherwise?.(e);
  }
};

export const tryOrAsync = async <R, O>(
  f: () => R,
  otherwise: (e: unknown) => O,
): Promise<R | O> => {
  try {
    return await f();
  } catch (e) {
    return otherwise?.(e);
  }
};

export const tryOrDefault = <R, O>(f: () => R, otherwise: O) => tryOr(f, () => otherwise);

export const tryOrDefaultAsync = <R, O>(f: () => R, otherwise: O) => tryOrAsync(f, () => otherwise);

export const tryOrIgnore = <R>(f: () => R) => tryOrDefault(f, undefined);

export const tryOrIgnoreAsync = <R>(f: () => R) => tryOrDefaultAsync(f, undefined);
