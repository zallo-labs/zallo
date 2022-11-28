import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProviderModule } from '~/provider/provider.module';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { SessionMiddleware } from './session.middleware';
import { SessionService } from './session.service';

@Global()
@Module({
  imports: [ProviderModule],
  exports: [AuthService, SessionService],
  controllers: [AuthController],
  providers: [AuthService, SessionService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware, AuthMiddleware).forRoutes('*');
  }
}
