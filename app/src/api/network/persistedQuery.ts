import { map } from 'rxjs';
import { Exchange } from './layer';
import crypto from 'crypto';
import { makeFetchBody } from './fetch';

export function persistedQueryExchange(): Exchange {
  const queryHash: Record<string, string> = {};
  let supported = true;

  return ({ forward }) => {
    return (operations$) => {
      return operations$.pipe(
        map((operation) => {
          if (!supported) return operation;

          // Send operation with PQ hash but without query text - unless previous attempt failed with `PersistedQueryNotFound`
          return {
            ...operation,
            fetchOptions: {
              ...operation.fetchOptions,
              body: makeFetchBody(operation, {
                ...(operation.context.persistedQueryNotFound !== true && { query: undefined }),
                extensions: {
                  persistedQuery: {
                    version: 1,
                    sha256Hash: (queryHash[operation.id] ??= sha256(operation.query)),
                  },
                },
              }),
            },
          };
        }),
        forward,
        map((result) => {
          if (result.errors?.length) {
            if (result.errors.find((e) => e.message === 'PersistedQueryNotFound')) {
              result.operation.context.persistedQueryNotFound = true;
              throw new Error('PersistedQueryNotFound', { cause: result });
            }

            if (result.errors.find((e) => e.message === 'PersistedQueryNotSupported')) {
              supported = false;
              throw new Error('PersistedQueryNotSupported', { cause: result });
            }
          }

          return result;
        }),
      );
    };
  };
}

function sha256(query: string) {
  return crypto.createHash('sha256').update(query).digest('hex');
}
