import { Module } from '@nestjs/common';
import { NodesResolver } from './nodes.resolver';

@Module({
  providers: [NodesResolver],
})
export class NodesModule {}
