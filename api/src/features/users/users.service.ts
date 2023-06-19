import { Injectable } from '@nestjs/common';
import { Address, SYNCSWAP_CONTRACTS, isAddress } from 'lib';
import { DatabaseService } from '../database/database.service';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { UpdateUserInput } from './users.input';
import { ProviderService } from '../util/provider/provider.service';
import { getUser, getUserCtx } from '~/request/ctx';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { UserInputError } from '@nestjs/apollo';
import { and } from '../database/database.util';

export const selectUser = (id: uuid | Address, shape?: ShapeFunc<typeof e.User>) =>
  e.select(e.User, (u) => ({
    ...shape?.(u),
    filter_single: isAddress(id) ? { address: id } : { id },
  }));

@Injectable()
export class UsersService {
  private hardcodedAddresses: Record<Address, string>;

  constructor(private db: DatabaseService, private provider: ProviderService) {
    this.hardcodedAddresses = {
      [this.provider.walletAddress]: 'Zallo',
      ...Object.fromEntries(
        Object.values(SYNCSWAP_CONTRACTS.router).map((address) => [address, 'SyncSwap'] as const),
      ),
    };
  }

  async selectUnique(address: Address, shape?: ShapeFunc<typeof e.User>) {
    const { address: userAddress, accounts } = getUserCtx();

    const r = (
      await this.db.query(
        e.select(e.User, (user) => ({
          // Returns user themself, or any account they are a member of
          // This really needs to sit at the database level, but can't due to the insert on conflict bug - https://github.com/edgedb/edgedb/issues/5504
          filter: and(
            e.op(user.address, '=', address),
            address !== userAddress && e.op(user.id, 'in', e.cast(e.uuid, e.set(...accounts))),
          ),
          limit: 1,
          ...shape?.(user),
        })),
      )
    )?.[0];

    return (
      r || {
        id: address,
        address,
        name: null,
      }
    );
  }

  async upsert(address: Address, { name, pushToken }: UpdateUserInput) {
    if (address !== getUser()) throw new UserInputError('Not user');

    return this.db.query(
      e.insert(e.User, { address, name, pushToken }).unlessConflict((user) => ({
        on: user.address,
        else: e.update(user, () => ({
          set: {
            name,
            pushToken,
          },
        })),
      })),
    );
  }

  async name(address: string, name?: string | null): Promise<string | null> {
    return (
      name ||
      (await this.db.query(
        e.select(e.Contact, () => ({
          filter_single: { user: selectUser(getUser()), address },
          name: true,
        })).name,
      )) ||
      this.hardcodedAddresses[address] ||
      (await this.provider.lookupAddress(address))
    );
  }
}
