import { Global, Module } from '@nestjs/common';

import { DatabaseHealthIndicator } from './database.health';
import { DatabaseService } from './database.service';

@Global()
@Module({
  exports: [DatabaseService, DatabaseHealthIndicator],
  providers: [DatabaseService, DatabaseHealthIndicator],
})
export class DatabaseModule {}
