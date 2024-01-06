import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestContextMiddleware } from 'nestjs-request-context';

import { NetworksModule } from '~/features/util/networks/networks.module';
import { AccountsCacheService } from './accounts.cache.service';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { SessionMiddleware } from './session.middleware';

@Global()
@Module({
  imports: [NetworksModule],
  exports: [SessionMiddleware, AuthMiddleware, RequestContextMiddleware, AccountsCacheService],
  controllers: [AuthController],
  providers: [SessionMiddleware, AuthMiddleware, RequestContextMiddleware, AccountsCacheService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware, AuthMiddleware, RequestContextMiddleware).forRoutes('*');
  }
}
