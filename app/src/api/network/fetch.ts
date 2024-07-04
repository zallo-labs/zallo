import { GraphQLSingularResponse } from 'relay-runtime';
import { filter, merge, mergeMap } from 'rxjs';
import { Exchange, OperationResult } from './layer';
import { OperationError } from './OperationError';

export interface FetchExchangeOptions extends RequestInit {
  url: string;
}

export function fetchExchange({ url, ...rootFetchOptions }: FetchExchangeOptions): Exchange {
  return ({ forward }) =>
    (operations$) => {
      const fetchResults$ = operations$.pipe(
        filter(({ kind }) => kind === 'query' || kind === 'mutation'),
        mergeMap(async (op): Promise<OperationResult> => {
          console.log('FETCHING', { op });
          try {
            const response = await fetch(url, {
              method: 'POST',
              body: JSON.stringify({
                query: op.text || '', // GraphQL text from input
                variables: op.variables,
              }),
              ...rootFetchOptions,
              ...op.fetchOptions,
              headers: {
                Accept: 'application/json',
                'Content-type': 'application/json',
                ...rootFetchOptions?.headers,
                ...op.fetchOptions?.headers,
              },
            });

            if (op.kind === 'mutation' && !response.ok) {
              console.log('mutation failed', { request: op, response });
              console.log('mutation failed', {
                request: op,
                response,
                data: await response.json(),
              });
            }

            if (!response.ok /* non 2xx response */) {
              if (op.kind === 'mutation') throw new OperationError(op, response);

              console.log('non 2xx response', { request: op, response });
              return { operation: op, response, errors: [] };
            }

            const data = await extractData(response);
            console.log('GOT DATA', { op, data });

            const errors = ('errors' in data && data.errors) || [];
            return { ...data, data: data.data || undefined, operation: op, response, errors };
          } catch (e) {
            if (e instanceof OperationError) throw e;

            throw new OperationError(op, undefined, e as Error);
          }
        }),
      );

      const forward$ = operations$.pipe(
        filter(({ kind }) => kind !== 'query' && kind !== 'mutation'),
        forward,
      );

      return merge(fetchResults$, forward$);
    };
}

async function extractData(response: Response) {
  if (response.headers.get('content-type')?.includes('application/json'))
    return (await response.json()) as GraphQLSingularResponse;

  return JSON.parse(await response.text()) as GraphQLSingularResponse;
}
