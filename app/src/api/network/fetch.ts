import { GraphQLSingularResponse } from 'relay-runtime';
import { filter, merge, mergeMap } from 'rxjs';
import { Exchange, Operation, OperationResult } from './layer';
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
          try {
            const response = await fetch(url, {
              method: 'POST',
              body: JSON.stringify({
                query: op.query,
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

            // Mutations must 2xx; queries may return non-2xx response with graphql errors
            if (!response.ok && op.kind === 'mutation') throw new OperationError(op, response);

            try {
              const data = await extractData(response);
              const errors = ('errors' in data && data.errors) || [];

              return { ...data, data: data.data || undefined, operation: op, response, errors };
            } catch (extractError) {
              throw new OperationError(op, response, extractError as Error);
            }
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

export function makeFetchBody(operation: Operation, extras?: Record<string, unknown>) {
  return JSON.stringify({
    operationName: operation.name,
    query: operation.query,
    variables: operation.variables,
    ...extras,
  });
}
