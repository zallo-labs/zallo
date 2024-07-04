import { GraphQLSingularResponse } from 'relay-runtime';
import { filter, merge, mergeMap } from 'rxjs';
import { Exchange, OperationResult } from './layer';
import { OperationRequestError } from './OperationRequestError';

export interface FetchExchangeOptions extends RequestInit {
  url: string;
}

export function fetchExchange({ url, ...rootFetchOptions }: FetchExchangeOptions): Exchange {
  return ({ forward }) =>
    (requests$) => {
      const fetchResults$ = requests$.pipe(
        filter(({ kind }) => kind === 'query' || kind === 'mutation'),
        mergeMap(async (request): Promise<OperationResult> => {
          const { operation, variables, fetchOptions } = request;

          try {
            const response = await fetch(url, {
              method: 'POST',
              body: JSON.stringify({
                query: operation.text || '', // GraphQL text from input
                variables,
              }),
              ...rootFetchOptions,
              ...fetchOptions,
              headers: {
                'content-type': 'application/json',
                ...rootFetchOptions?.headers,
                ...fetchOptions?.headers,
              },
            });

            if (request.kind === 'mutation' && !response.ok) {
              console.log('mutation failed', { request, response });
              console.log('mutation failed', { request, response, data: await response.json() });
            }

            if (!response.ok /* non 2xx response */) {
              if (request.kind === 'mutation') throw new OperationRequestError(request, response);

              console.log('non 2xx response', { request, response });
              return { request, response, errors: [] };
            }

            const data = (await response.json()) as GraphQLSingularResponse;

            return { ...data, data: data.data || undefined, request, response, errors: [] };
          } catch (e) {
            if (e instanceof OperationRequestError) throw e;

            throw new OperationRequestError(request, undefined, e as Error);
          }
        }),
      );

      const forward$ = requests$.pipe(
        filter(({ kind }) => kind !== 'query' && kind !== 'mutation'),
        forward,
      );

      return merge(fetchResults$, forward$);
    };
}
