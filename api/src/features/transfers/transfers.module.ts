import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersResolver } from './transfers.resolver';
import { EventsModule } from '../events/events.module';
import { TransfersEvents } from './transfers.events';
import { TransactionsModule } from '../transactions/transactions.module';
import { PricesModule } from '../prices/prices.module';
import { ExpoModule } from '../util/expo/expo.module';
import { BalancesModule } from '~/features/util/balances/balances.module';
import { TokensModule } from '~/features/tokens/tokens.module';

@Module({
  imports: [
    EventsModule,
    TransactionsModule,
    EventsModule,
    PricesModule,
    ExpoModule,
    BalancesModule,
    TokensModule,
  ],
  providers: [TransfersService, TransfersResolver, TransfersEvents],
})
export class TransfersModule {}
