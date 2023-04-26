import './util/patches';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { CONFIG, __DEBUG__ } from '~/config';
import { GQL_ENDPOINT } from './apollo/apollo.module';
import { PrismaService } from './features/util/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: true, credentials: true },
    logger: [...(__DEBUG__ ? (['debug', 'verbose'] as const) : []), 'log', 'warn', 'error'],
  });

  // Allow prisma to gracefully shutdown app
  app.get(PrismaService).enableShutdownHooks(app);

  await app.listen(CONFIG.apiPort);
  Logger.debug(`${await app.getUrl()}${GQL_ENDPOINT}`);
}
bootstrap();
