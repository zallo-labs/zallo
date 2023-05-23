import './util/patches';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { CONFIG, LogLevel } from '~/config';
import { GQL_ENDPOINT } from './apollo/apollo.module';
import { enableExceptionHooks } from './process.hooks';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: true, credentials: true },
    logger: [...Object.values(LogLevel).slice(Object.values(LogLevel).indexOf(CONFIG.logLevel))],
  });

  app.enableShutdownHooks(); // Enable shutdown signals
  enableExceptionHooks();

  await app.listen(CONFIG.apiPort);
  Logger.debug(`${await app.getUrl()}${GQL_ENDPOINT}`);
}
bootstrap();
