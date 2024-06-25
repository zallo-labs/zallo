import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { UAddress, asAddress, asChain, isEthToken, tryOrIgnoreAsync } from 'lib';
import { ERC20 } from 'lib/dapps';
import { NetworksService } from '~/core/networks';

export interface BalanceArgs {
  account: UAddress;
  token: UAddress;
}

@Injectable()
export class BalancesService {
  constructor(
    private networks: NetworksService,
    @InjectRedis() private redis: Redis,
  ) {}

  async balance(args: BalanceArgs) {
    const key = this.key(args);
    const cached = await this.redis.get(key);
    if (cached) return BigInt(cached);

    const { account } = args;
    const network = this.networks.get(account);
    const balance = await tryOrIgnoreAsync(async () => {
      if (asChain(account) !== asChain(args.token)) return 0n;

      const token = asAddress(args.token);
      if (isEthToken(token)) return await network.getBalance({ address: asAddress(account) });

      return await network.readContract({
        abi: ERC20,
        address: token,
        functionName: 'balanceOf',
        args: [asAddress(account)],
      });
    });

    // Balance must be expired due to rebalancing tokens
    if (balance !== undefined) this.redis.set(key, balance.toString(), 'EX', 86400 /* 24 hours */);

    return balance ?? 0n;
  }

  invalidateBalance(args: BalanceArgs) {
    return this.redis.del(this.key(args));
  }

  private key(args: BalanceArgs) {
    return `balance:${args.account}:${args.token}`;
  }
}
