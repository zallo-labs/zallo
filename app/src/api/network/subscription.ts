import { GraphQLResponse, GraphQLResponseWithData, GraphQLSingularResponse } from 'relay-runtime';
import { Client as WebsocketClient } from 'graphql-ws';
import { Observable, filter, merge, mergeMap } from 'rxjs';
import { Exchange, OperationResult } from './layer';
import { OperationRequestError } from './OperationRequestError';

export function subscriptionExchange(client: WebsocketClient): Exchange {
  return ({ forward }) =>
    (requests$) => {
      const subscriptions$ = requests$.pipe(
        filter(({ kind: type }) => type === 'subscription'),
        mergeMap((request) => {
          return new Observable<OperationResult>((sink) =>
            client.subscribe<GraphQLResponse>(
              {
                operationName: request.operation.name,
                query: request.operation.text || '',
                variables: request.variables,
              },
              {
                next(value) {
                  if (value.data) {
                    if (Array.isArray(value.data)) {
                      value.data.forEach((data) => sink.next({ ...data, request }));
                    } else {
                      sink.next({ ...(value.data as GraphQLResponseWithData), request });
                    }
                  }
                },
                error(error: Error) {
                  sink.error(new OperationRequestError(request, undefined, error));
                },
                complete() {
                  sink.complete();
                },
              },
            ),
          );
        }),
      );

      const forward$ = requests$.pipe(
        filter(({ kind: type }) => type !== 'subscription'),
        forward,
      );

      return merge(subscriptions$, forward$);
    };
}
