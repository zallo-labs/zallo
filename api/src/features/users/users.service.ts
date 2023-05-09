import { Injectable } from '@nestjs/common';
import { Address } from 'lib';
import { DatabaseService } from '../database/database.service';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { UpdateUserArgs } from './users.args';
import { ProviderService } from '../util/provider/provider.service';
import { getUser } from '~/request/ctx';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService, private provider: ProviderService) {}

  async selectUnique(address: Address, shape?: ShapeFunc<typeof e.User>) {
    const r = await e
      .select(e.User, (u) => ({
        ...(shape && shape(u)),
        filter_single: { address },
      }))
      .run(this.db.client);

    return r ?? { id: address, address, name: null };
  }

  async upsert(address: Address, { name, pushToken }: UpdateUserArgs) {
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
      (await e.insert(e.Device, { address, name, pushToken }).run(this.db.client))
    );
  }

  async name(address: string) {
    const contact = await e
      .select(e.Contact, () => ({
        filter_single: {
          user: e.select(e.User, () => ({ filter_single: { address: getUser() } })),
          address,
        },
        name: true,
      }))
      .name.run(this.db.client);

    const zalloMatch = address === this.provider.walletAddress && 'Zallo';

    return contact || zalloMatch || (await this.provider.lookupAddress(address));
  }
}
