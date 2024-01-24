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
import { getRequestContext } from '~/request/ctx';
// import { SpanStatus } from '@sentry/tracing';

type Filter<E = any> = [type: new (...args: any[]) => E, shouldReport: (exception: E) => boolean];

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  private readonly filters: Filter[] = [
    [UnauthorizedException, () => false] satisfies Filter<UnauthorizedException>,
  ];

  intercept(context: ExecutionContext, next: CallHandler) {
    const transaction = Sentry.startTransaction({
      op: 'request',
      name: `${context.getClass().name}.${context.getHandler().name}`,
    });
    Sentry.getCurrentHub().getScope().setSpan(transaction);

    return next.handle().pipe(
      tap({
        complete: () => {
          transaction.setStatus('ok');
        },
        error: (exception) => {
          transaction.setStatus('unknown_error');
          if (this.shouldReport(exception)) {
            Sentry.withScope((scope) => {
              const userCtx = getRequestContext().user;
              if (userCtx) scope.setUser({ id: userCtx.approver });
              scope.setExtra('exceptionData', JSON.stringify(exception, null, 2));

              this.addContextExceptionMetadata(scope, context);

              return Sentry.captureException(exception);
            });
          }
        },
        finalize: () => {
          transaction.finish();
        },
      }),
    );
  }

  private addContextExceptionMetadata(scope: Sentry.Scope, context: ExecutionContext) {
    match(context.getType<GqlContextType>())
      .with('graphql', () => {
        const gqlHost = GqlArgumentsHost.create(context);
        const ctx = gqlHost.getContext();
        this.addRequestToScope(scope, ctx?.req || ctx);

        const info = gqlHost.getInfo();
        scope.setExtra('fieldName', info.fieldName);
        const args = gqlHost.getArgs();
        scope.setExtra('args', JSON.stringify(args, null, 2));
      })
      .with('http', () => {
        const http = context.switchToHttp();
        this.addRequestToScope(scope, http.getRequest());
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

  private addRequestToScope(scope: Sentry.Scope, req: Request) {
    scope.setExtra('request', Sentry.addRequestDataToEvent({}, req));
  }

  private shouldReport(exception: unknown): boolean {
    return this.filters.every(
      ([type, filter]) => !(exception instanceof type && (!filter || filter(exception))),
    );
  }
}
