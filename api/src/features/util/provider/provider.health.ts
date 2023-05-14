import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import { ProviderService } from './provider.service';

@Injectable()
export class ProviderHealthIndicator extends HealthIndicator {
  constructor(private provider: ProviderService) {
    super();
  }

  async check(key: string) {
    try {
      await this.provider.getBlockNumber();
      return this.getStatus(key, true, { status: 'ok' });
    } catch (e) {
      throw new HealthCheckError('Provider check failed', e);
    }
  }
}
