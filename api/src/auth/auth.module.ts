import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProviderModule } from '~/provider/provider.module';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { SessionMiddleware } from './session.middleware';

@Module({
  imports: [ProviderModule],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware, AuthMiddleware).forRoutes('*');
  }
}
