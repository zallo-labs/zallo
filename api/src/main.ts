import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { CONFIG } from '~/config';
import { GQL_ENDPOINT } from './apollo/apollo.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: true, credentials: true },
  });

  if (process.env.ONLY_GENERATE_SCHEMA) {
    await app.init();
    return app.close();
  }

  await app.listen(CONFIG.apiPort);
  Logger.debug(`${await app.getUrl()}${GQL_ENDPOINT}`);
}
bootstrap();
