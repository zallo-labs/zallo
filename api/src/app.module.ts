import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from 'nestjs-prisma';
import { loggingMiddleware } from './prisma/prisma.logging';
import { HealthModule } from './health/health.module';
import { DevicesModule } from './features/devices/devices.module';
import { AccountsModule } from './features/accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { ApolloModule } from './apollo/apollo.module';
import { ProviderModule } from './provider/provider.module';
import { ContactsModule } from './features/contacts/contacts.module';
import { ApproversModule } from './features/approvers/approvers.module';
import { ContractMethodsModule } from './features/contract-methods/contract-methods.module';
import { ProposalsModule } from './features/proposals/proposals.module';
import { SubmissionsModule } from './features/submissions/submissions.module';
import { CommentsModule } from './features/comments/comments.module';
import { ReactionsModule } from './features/reactions/reactions.module';
import { FaucetModule } from './features/faucet/faucet.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CONFIG } from './config';
import { UsersModule } from './features/users/users.module';
import { SubgraphModule } from './features/subgraph/subgraph.module';
import { ExpoModule } from './expo/expo.module';
import { PubsubModule } from './pubsub/pubsub.module';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
    RedisModule.forRoot({ config: { url: CONFIG.redisUrl } }),
    AuthModule,
    ApolloModule,
    PubsubModule,
    ProviderModule,
    HealthModule,
    // Features
    AccountsModule,
    ApproversModule,
    CommentsModule,
    ContactsModule,
    ContractMethodsModule,
    DevicesModule,
    FaucetModule,
    ProposalsModule,
    ReactionsModule,
    SubgraphModule,
    SubmissionsModule,
    UsersModule,
    ExpoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
