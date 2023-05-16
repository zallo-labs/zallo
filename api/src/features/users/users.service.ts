import { Injectable } from '@nestjs/common';
import { Address, isAddress } from 'lib';
import { DatabaseService } from '../database/database.service';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { UpdateUserInput } from './users.input';
import { ProviderService } from '../util/provider/provider.service';
import { getUser } from '~/request/ctx';
import { uuid } from 'edgedb/dist/codecs/ifaces';

export const selectUser = (id: uuid | Address, shape?: ShapeFunc<typeof e.User>) =>
  e.select(e.User, (u) => ({
    ...shape?.(u),
    filter_single: isAddress(id) ? { address: id } : { id },
  }));

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService, private provider: ProviderService) {}

  async selectUnique(address: Address, shape?: ShapeFunc<typeof e.User>) {
    return (
      (await this.db.query(selectUser(address, shape))) ?? { id: address, address, name: null }
    );
  }

  async upsert(address: Address, { name, pushToken }: UpdateUserInput) {
    // unlessConflict() upsert can't be performed as the address constraint is on the abstract User type
    return (
      (await e
        .update(e.Device, () => ({
          filter_single: { address },
          set: {
            name,
            pushToken,
          },
        }))
        .run(this.db.client)) ??
      (await e.insert(e.Device, { address, name, pushToken }).unlessConflict().run(this.db.client))
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
      (address === this.provider.walletAddress && 'Zallo') ||
      (await this.provider.lookupAddress(address))
    );
  }
}
