import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

import { CONFIG } from 'config';
import { GQL_ENDPOINT } from './apollo/apollo.module';
import { authSessionRequestHandler } from './auth/auth.session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(authSessionRequestHandler());

  await app.listen(CONFIG.api.port);
  Logger.debug(`${await app.getUrl()}${GQL_ENDPOINT}`);
}
bootstrap();
