import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { UpdateUserInput } from './users.input';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { randomBytes } from 'crypto';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { UserInputError } from '@nestjs/apollo';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { Address } from 'lib';

@Injectable()
export class UsersService {
  constructor(
    private db: DatabaseService,
    @InjectRedis()
    private readonly redis: Redis,
    private accountsCache: AccountsCacheService,
  ) {}

  async selectUnique(shape?: ShapeFunc<typeof e.global.current_user>) {
    return this.db.query(
      e.select(e.global.current_user, (u) => ({
        ...shape?.(u),
      })),
    );
  }

  async update({ name }: UpdateUserInput) {
    return this.db.query(
      e.update(e.global.current_user, () => ({
        set: { name },
      })),
    );
  }

  async getPairingToken(user: uuid) {
    const secretKey = this.getPairingSecretKey(user);
    let secret = await this.redis.get(secretKey);
    if (!secret) {
      // Generate a new code
      secret = randomBytes(32).toString('hex');
      await this.redis.set(secretKey, secret, 'EX', 60 * 60 /* 1 hour */);
    }

    return `${user}:${secret}`;
  }

  async pair(token: string) {
    const [user, secret] = token.split(':');

    const expectedSecret = await this.redis.get(this.getPairingSecretKey(user));
    if (secret !== expectedSecret)
      throw new UserInputError(`Invalid pairing token; token may have expired (1h)`);

    // Pair with the user - merging their approvers into the current user
    // User will be implicitly deleted due to Approver.user link source deletion policy
    const approvers = await this.db.query(
      e.select(
        e.update(e.Approver, (a) => ({
          filter: e.op(a.user.id, '=', user),
          set: {
            user: e.global.current_user,
            // Append (from old user) to the name if it already exists
            name: e.op(
              a.name,
              'if',
              e.op(
                a.name,
                'not in',
                e.select(e.Approver, () => ({
                  filter: e.op(a.user.id, '=', e.global.current_user.id),
                  name: true,
                })).name,
              ),
              'else',
              e.op(a.name, '++', ' (from old user)'),
            ),
          },
        })),
        () => ({ address: true }),
      ).address,
    );

    // Remove approver -> user cache
    await this.accountsCache.removeCache(...(approvers as Address[]));

    // Remove pairing secret
    await this.redis.del(this.getPairingSecretKey(user));
  }

  private getPairingSecretKey(user: uuid) {
    return `pairing-secret:${user}`;
  }
}
