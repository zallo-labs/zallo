import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestContextMiddleware } from 'nestjs-request-context';
import { ProviderModule } from '~/features/util/provider/provider.module';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { SessionMiddleware } from './session.middleware';
import { AccountsCacheService } from './accounts.cache.service';

@Global()
@Module({
  imports: [ProviderModule],
  exports: [SessionMiddleware, AuthMiddleware, RequestContextMiddleware, AccountsCacheService],
  controllers: [AuthController],
  providers: [SessionMiddleware, AuthMiddleware, RequestContextMiddleware, AccountsCacheService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware, AuthMiddleware, RequestContextMiddleware).forRoutes('*');
  }
}
