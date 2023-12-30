import { Redis } from 'ioredis';
import { toSet } from 'lib';
import { LockOptions, Mutex } from 'redis-semaphore';

const DEFAULT_OPTIONS = { lockTimeout: 60_000, acquireTimeout: 60_000 } satisfies LockOptions;

export interface RunExclusivelyOptions extends LockOptions {
  redis: Redis;
  key: string | string[];
}

export async function runExclusively<R>(
  f: () => R,
  { redis, key: keys, ...options }: RunExclusivelyOptions,
): Promise<R> {
  const locks = [...toSet(keys)].map(
    (key) =>
      new Mutex(redis, key, {
        ...DEFAULT_OPTIONS,
        ...options,
      }),
  );

  await Promise.all(locks.map((lock) => lock.acquire()));
  try {
    return await f();
  } finally {
    locks.map((lock) => lock.release());
  }
}

export interface RunOnceOptions extends LockOptions {
  redis: Redis;
  key: string;
}

export async function runOnce<R>(
  f: () => R,
  { redis, key, ...options }: RunOnceOptions,
): Promise<Awaited<R> | void> {
  const lock = new Mutex(redis, key, {
    ...DEFAULT_OPTIONS,
    ...options,
  });

  try {
    if (!(await lock.tryAcquire())) return;

    return await f();
  } finally {
    await lock.release();
  }
}
