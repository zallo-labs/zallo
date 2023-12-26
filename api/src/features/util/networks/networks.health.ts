import { Injectable } from '@nestjs/common';
import { HealthIndicator } from '@nestjs/terminus';
import { NetworksService } from './networks.service';

@Injectable()
export class NetworksHealthIndicator extends HealthIndicator {
  constructor(private networks: NetworksService) {
    super();
  }

  async check(key: string) {
    const statuses = Object.fromEntries(
      await Promise.all(
        [...this.networks.all()]
          .filter((n) => n.chain.key !== 'zksync-local')
          .map(async (c) => {
            const status = await c.status();

            return [
              c.chain.key,
              status === 'healthy'
                ? { status: 'up' }
                : {
                    status: 'down',
                    error: status.name,
                    message: status.message,
                  },
            ] as const;
          }),
      ),
    );

    const healthy = Object.values(statuses).every((r) => r.status === 'up');

    return this.getStatus(key, healthy, statuses);
  }
}
