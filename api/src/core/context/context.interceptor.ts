import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';
import { getContextUnsafe } from '.';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { GqlContext } from '~/core/apollo/ctx';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(execContext: ExecutionContext, next: CallHandler<any>) {
    return next.handle().pipe(
      tap({
        finalize: () => {
          const context = this.context(execContext);

          // Don't wait for hooks to execute to finalize
          (async () => {
            for (const hook of context.afterRequestHooks) {
              hook();
            }
          })();
        },
      }),
    );
  }

  private context(execContext: ExecutionContext) {
    const c = getContextUnsafe();
    if (c) return c;

    // Restore subscription context
    if (execContext.getType<GqlContextType>() === 'graphql')
      return GqlExecutionContext.create(execContext).getContext<GqlContext>();

    throw new Error('Unable to restore context');
  }
}
