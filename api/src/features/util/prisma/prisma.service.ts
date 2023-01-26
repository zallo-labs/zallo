import { INestApplication, INestMicroservice, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { loggingMiddleware } from './prisma.logging';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
    this.$use(loggingMiddleware());
  }

  onModuleInit() {
    return this.$connect();
  }

  enableShutdownHooks(app: INestApplication | INestMicroservice) {
    return this.$on('beforeExit', app.close);
  }
}
