import { Module } from '@nestjs/common';

import { TokensModule } from '~/features/tokens/tokens.module';
import { BalancesModule } from '~/features/util/balances/balances.module';
import { EventsModule } from '../events/events.module';
import { PricesModule } from '../prices/prices.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ExpoModule } from '../util/expo/expo.module';
import { TransfersEvents } from './transfers.events';
import { TransfersResolver } from './transfers.resolver';
import { TransfersService } from './transfers.service';

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
