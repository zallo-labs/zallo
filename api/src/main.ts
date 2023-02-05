import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { CONFIG } from '~/config';
import { GQL_ENDPOINT } from './apollo/apollo.module';
import { PrismaService } from './features/util/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: true, credentials: true },
  });

  // Allow prisma to gracefully shutdown app
  app.get(PrismaService).enableShutdownHooks(app);

  await app.listen(CONFIG.apiPort);
  Logger.debug(`${await app.getUrl()}${GQL_ENDPOINT}`);
}
bootstrap();
