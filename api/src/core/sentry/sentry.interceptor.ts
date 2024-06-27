import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import type { GqlContextType } from '@nestjs/graphql';
import { GqlArgumentsHost } from '@nestjs/graphql';
import * as Sentry from '@sentry/node';
import { Request } from 'express';
import { tap } from 'rxjs/operators';
import { match } from 'ts-pattern';
import { GqlContext } from '~/core/apollo/ctx';
import { getContextUnsafe } from '../context';
import { SpanStatus } from '@sentry/tracing';
import { execute } from 'graphql';
import { Scope } from '@sentry/node';

type Filter<E = unknown> = [
  type: new (...args: any[]) => E,
  shouldReport: (exception: E) => boolean,
];

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  private readonly filters: Filter[] = [
    [UnauthorizedException, () => false] satisfies Filter<UnauthorizedException>,
  ];

  intercept(context: ExecutionContext, next: CallHandler) {
    return this.withUserScope((scope) =>
      Sentry.continueTrace(this.extractTrace(context), () =>
        Sentry.startSpanManual(
          {
            op: `${context.getType()}.request`,
            name: `${context.getClass().name}.${context.getHandler().name}`,
          },
          (span) =>
            next.handle().pipe(
              tap({
                complete: () => {
                  span.setStatus({ code: 1 /* ok */, message: SpanStatus.Ok });
                },
                error: (exception) => {
                  span.setStatus({
                    code: 2 /* error */,
                    message:
                      execute instanceof UnauthorizedException
                        ? SpanStatus.Unauthenticated
                        : SpanStatus.UnknownError,
                  });
                  if (!this.shouldReport(exception)) return;

                  scope.setExtra('exceptionData', JSON.stringify(exception, null, 2));
                  this.addContextExceptionMetadata(scope, context);

                  Sentry.captureException(exception);
                },
                finalize: () => {
                  span.end();
                },
              }),
            ),
        ),
      ),
    );
  }

  private addContextExceptionMetadata(scope: Sentry.Scope, context: ExecutionContext) {
    match(context.getType<GqlContextType>())
      .with('graphql', () => {
        const gqlHost = GqlArgumentsHost.create(context);
        const ctx = gqlHost.getContext<GqlContext>();
        scope.setExtra('request', Sentry.addRequestDataToEvent({}, ctx.req));

        scope.setExtra('fieldName', gqlHost.getInfo().fieldName);
        scope.setExtra('args', JSON.stringify(gqlHost.getArgs(), null, 2));
      })
      .with('http', () => {
        const http = context.switchToHttp();
        scope.setExtra('request', Sentry.addRequestDataToEvent({}, http.getRequest()));
      })
      .with('ws', () => {
        const ws = context.switchToWs();
        scope.setExtra('ws_client', ws.getClient());
        scope.setExtra('ws_data', ws.getData());
      })
      .with('rpc', () => {
        const rpc = context.switchToRpc();
        scope.setExtra('rpc_data', rpc.getData());
      })
      .exhaustive();
  }

  private withUserScope<T>(callback: (scope: Scope) => T): T {
    return Sentry.withScope((scope) => {
      const ctx = getContextUnsafe();
      if (ctx?.user) scope.setUser({ id: ctx.user.approver });

      return callback(scope);
    });
  }

  private extractTrace(context: ExecutionContext) {
    return (
      match(context.getType<GqlContextType>())
        .with('graphql', () => {
          const gqlHost = GqlArgumentsHost.create(context);
          return this.traceRequest(gqlHost.getContext<GqlContext>().req);
        })
        .with('http', () => {
          const http = context.switchToHttp();
          return this.traceRequest(http.getRequest());
        })
        // TODO: ws
        .otherwise(() => ({ sentryTrace: undefined, baggage: undefined }))
    );
  }

  private traceRequest(request: Request) {
    const st = request.headers['sentry-trace'];
    const sentryTrace = Array.isArray(st) ? st.join(',') : st;
    const baggage = request.headers['baggage'];

    return { sentryTrace, baggage };
  }

  private shouldReport(exception: unknown): boolean {
    return this.filters.every(
      ([type, filter]) => !(exception instanceof type && (!filter || filter(exception))),
    );
  }
}
