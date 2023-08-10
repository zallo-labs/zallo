export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  retryIf?: (e: unknown) => boolean;
  signal?: AbortSignal;
}

export async function retryAsync<R>(
  f: () => Promise<R>,
  opts: RetryOptions = {},
  attempt = 1,
): Promise<R> {
  const { maxAttempts = 3, delayMs = 0, retryIf } = opts;

  try {
    return await f();
  } catch (e) {
    if (attempt >= maxAttempts - 1 || opts.signal?.aborted || retryIf?.(e) === false) throw e;

    return new Promise((resolve) => {
      setTimeout(() => resolve(retryAsync(f, opts, attempt + 1)), delayMs);
    });
  }
}
