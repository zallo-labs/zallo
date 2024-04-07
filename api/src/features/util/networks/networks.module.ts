import { Global, Module } from '@nestjs/common';
import { NetworksHealthIndicator } from './networks.health';
import { NetworksService } from './networks.service';
import { registerBullQueue } from '../bull/bull.util';
import { NetworkQueue, NetworkWorker } from './networks.worker';

@Global()
@Module({
  imports: [...registerBullQueue(NetworkQueue)],
  exports: [NetworksService, NetworksHealthIndicator],
  providers: [NetworksService, NetworksHealthIndicator, NetworkWorker],
})
export class NetworksModule {}
