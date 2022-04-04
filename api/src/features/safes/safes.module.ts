import { Module } from '@nestjs/common';
import { SafesResolver } from './safes.resolver';

@Module({
  providers: [SafesResolver],
})
export class SafesModule {}
