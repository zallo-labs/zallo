import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersResolver } from './transfers.resolver';
import { EventsModule } from '../events/events.module';
import { TransfersEvents } from './transfers.events';
import { SystemTxsModule } from '../system-txs/system-txs.module';
import { PricesModule } from '../prices/prices.module';
import { ExpoModule } from '~/core/expo/expo.module';
import { BalancesModule } from '~/core/balances/balances.module';
import { TokensModule } from '~/feat/tokens/tokens.module';

@Module({
  imports: [
    EventsModule,
    SystemTxsModule,
    EventsModule,
    PricesModule,
    ExpoModule,
    BalancesModule,
    TokensModule,
  ],
  providers: [TransfersService, TransfersResolver, TransfersEvents],
  exports: [TransfersService],
})
export class TransfersModule {}
