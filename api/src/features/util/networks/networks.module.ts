import { Global, Module } from '@nestjs/common';

import { NetworksHealthIndicator } from './networks.health';
import { NetworksService } from './networks.service';

@Global()
@Module({
  exports: [NetworksService, NetworksHealthIndicator],
  providers: [NetworksService, NetworksHealthIndicator],
})
export class NetworksModule {}
