import { Module } from '@nestjs/common';
import { PrismaModule as BasePrismaModule } from 'nestjs-prisma';
import { loggingMiddleware } from './prisma.logging';

@Module({
  imports: [
    BasePrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
  ],
})
export class PrismaModule {}
