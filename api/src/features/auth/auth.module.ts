import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { NetworksModule } from '~/features/util/networks/networks.module';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { SessionMiddleware } from './session.middleware';
import { AccountsCacheService } from './accounts.cache.service';

@Global()
@Module({
  imports: [NetworksModule],
  exports: [SessionMiddleware, AuthMiddleware, AccountsCacheService],
  controllers: [AuthController],
  providers: [SessionMiddleware, AuthMiddleware, AccountsCacheService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware, AuthMiddleware).forRoutes('*');
  }
}
