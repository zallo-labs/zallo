import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import { DatabaseService } from './database.service';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private db: DatabaseService) {
    super();
  }

  async check(key: string) {
    try {
      await this.db.authedClient.ensureConnected();
      return this.getStatus(key, true, { status: 'ok' });
    } catch (e) {
      throw new HealthCheckError('Database check failed', e);
    }
  }
}
