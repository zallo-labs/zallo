import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ContextMiddleware } from './context.middleware';
import { ContextInterceptor } from './context.interceptor';

@Global()
@Module({
  providers: [ContextMiddleware, ContextInterceptor],
  exports: [ContextMiddleware, ContextInterceptor],
})
export class ContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*');
  }
}
