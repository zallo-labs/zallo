import { Module } from '@nestjs/common';
import { ReactionsResolver } from './reactions.resolver';

@Module({
  providers: [ReactionsResolver],
})
export class ReactionsModule {}
