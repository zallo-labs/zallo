import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost, RpcArgumentsHost, WsArgumentsHost } from '@nestjs/common/interfaces';
import type { GqlContextType, GraphQLArgumentsHost } from '@nestjs/graphql';
import { GqlArgumentsHost } from '@nestjs/graphql';
import * as Sentry from '@sentry/node';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { match } from 'ts-pattern';

type Filter<E = any> = [type: new (...args: any[]) => E, shouldReport: (exception: E) => boolean];

// Based off https://github.com/mentos1386/nest-raven
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  private readonly filters: Filter[] = [
    [UnauthorizedException, () => false] satisfies Filter<UnauthorizedException>,
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // first param would be for events, second is for errors
    return next.handle().pipe(
      tap({
        error: (exception) => {
          if (this.shouldReport(exception)) {
            Sentry.withScope((scope) => {
              scope.setExtra('exceptionData', JSON.stringify(exception));

              match(context.getType<GqlContextType>())
                .with('graphql', () =>
                  this.addGraphQLExceptionMetadatas(scope, GqlArgumentsHost.create(context)),
                )
                .with('http', () => this.addHttpExceptionMetadatas(scope, context.switchToHttp()))
                .with('ws', () => this.addWsExceptionMetadatas(scope, context.switchToWs()))
                .with('rpc', () => this.addRpcExceptionMetadatas(scope, context.switchToRpc()))
                .exhaustive();

              return Sentry.captureException(exception);
            });
          }
        },
      }),
    );
  }

  private addGraphQLExceptionMetadatas(scope: Sentry.Scope, gqlHost: GraphQLArgumentsHost): void {
    const context = gqlHost.getContext();
    this.addRequestToScope(scope, context?.req || context);

    // GraphQL Specifics
    const info = gqlHost.getInfo();
    scope.setExtra('fieldName', info.fieldName);
    const args = gqlHost.getArgs();
    scope.setExtra('args', args);
  }

  private addHttpExceptionMetadatas(scope: Sentry.Scope, http: HttpArgumentsHost): void {
    this.addRequestToScope(scope, http.getRequest());
  }

  private addRequestToScope(scope: Sentry.Scope, req: Request) {
    const event = Sentry.addRequestDataToEvent({}, req);

    if (event.user) scope.setUser(event.user);
  }

  private addRpcExceptionMetadatas(scope: Sentry.Scope, rpc: RpcArgumentsHost): void {
    scope.setExtra('rpc_data', rpc.getData());
  }

  private addWsExceptionMetadatas(scope: Sentry.Scope, ws: WsArgumentsHost): void {
    scope.setExtra('ws_client', ws.getClient());
    scope.setExtra('ws_data', ws.getData());
  }

  private shouldReport(exception: unknown): boolean {
    return this.filters.every(
      ([type, filter]) => !(exception instanceof type && (!filter || filter(exception))),
    );
  }
}
