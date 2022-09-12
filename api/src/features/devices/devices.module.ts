import { Module } from '@nestjs/common';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { DevicesResolver } from './devices.resolver';

@Module({
  imports: [SubgraphModule],
  providers: [DevicesResolver],
})
export class DevicesModule {}
