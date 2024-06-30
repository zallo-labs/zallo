import { ApolloServerPlugin } from '@apollo/server';
import * as Sentry from '@sentry/node';
import { Context } from '../context';
import { CONFIG } from '~/config';

// See lifecycle: https://www.apollographql.com/docs/apollo-server/integrations/plugins/#request-lifecycle-event-flow

export const createApolloTracingPlugin = (): ApolloServerPlugin<Context> => {
  if (!CONFIG.sentryDsn) return {};

  return {
    requestDidStart: async ({ operationName }) =>
      Sentry.startSpanManual(
        { op: 'graphql.request', name: operationName || 'Unnamed' },
        (requestSpan) => ({
          executionDidStart: async () => ({
            willResolveField: ({ info }) =>
              Sentry.startSpanManual(
                {
                  op: 'graphql.resolve',
                  name: `${info.parentType.name}.${info.fieldName}`,
                },
                (resolverSpan) => {
                  return () => resolverSpan.end();
                },
              ),
          }),
          willSendResponse: async () => requestSpan.end(),
        }),
      ),
  };
};
