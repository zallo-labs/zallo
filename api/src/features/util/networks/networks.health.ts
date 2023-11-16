import { Injectable } from '@nestjs/common';
import { HealthIndicator } from '@nestjs/terminus';
import { Network, NetworksService } from './networks.service';
import { fromPromise } from 'neverthrow';

@Injectable()
export class NetworksHealthIndicator extends HealthIndicator {
  constructor(private networks: NetworksService) {
    super();
  }

  async check(key: string) {
    const networks: Network[] = []; // Array.fromAsync(...) when supported
    for await (const network of this.networks) {
      networks.push(network);
    }

    const statuses = Object.fromEntries(
      await Promise.all(
        networks.map(async (c) => {
          const r = await fromPromise(
            (async () => ({ blockNumber: await c.getBlockNumber() }))(),
            (e) => ({ error: e as Error }),
          );

          return [
            c.chain.key,
            {
              healthy: r.isOk(),
              ...(r.isOk() ? r.value : r.error),
            },
          ] as const;
        }),
      ),
    );

    const healthy = Object.values(statuses).every((r) => r.healthy);

    return this.getStatus(key, healthy, statuses);
  }
}
