import { Injectable } from '@nestjs/common';
import { Address } from 'lib';
import { ShapeFunc } from '../database/database.select';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ContactsInput, UpsertContactInput } from './contacts.input';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { isAddress } from 'ethers/lib/utils';
import { or } from '../database/database.util';
import { ProviderService } from '../util/provider/provider.service';
import { CONFIG } from '~/config';

type UniqueContact = uuid | Address;

export const uniqueContact = (u: UniqueContact) =>
  e.shape(e.Contact, () => ({
    filter_single: isAddress(u) ? { user: e.global.current_user, address: u } : { id: u },
  }));

@Injectable()
export class ContactsService {
  private hardcodedContracts: Record<Address, string>;

  constructor(
    private db: DatabaseService,
    private provider: ProviderService,
  ) {
    this.hardcodedContracts = {
      [this.provider.walletAddress]: 'Zallo',
      // mainnet TODO: handle chain
      '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295': 'SyncSwap', // SyncSwap router - mainnet
      '0xB3b7fCbb8Db37bC6f572634299A58f51622A847e': 'SyncSwap', // SyncSwap router - testnet
    };
  }

  async selectUnique(id: UniqueContact, shape?: ShapeFunc<typeof e.Contact>) {
    return e
      .select(e.Contact, (c) => ({
        ...shape?.(c),
        ...uniqueContact(id)(c),
      }))
      .run(this.db.client);
  }

  async select({ query }: ContactsInput, shape?: ShapeFunc<typeof e.Contact>) {
    return e
      .select(e.Contact, (c) => ({
        ...shape?.(c),
        filter: query
          ? or(e.op(c.address, 'ilike', query), e.op(c.label, 'ilike', query))
          : undefined,
      }))
      .run(this.db.client);
  }

  async upsert({ previousAddress, address, label }: UpsertContactInput) {
    // Ignore leading and trailing whitespace
    label = label.trim();

    // UNLESS CONFLICT ON can only be used on a single property, so (= newAddress OR = previousAddress) nor a simple upsert is  possible
    if (previousAddress && previousAddress !== address) {
      const id = await this.db.query(
        e.update(e.Contact, (c) => ({
          ...uniqueContact(previousAddress)(c),
          set: {
            address,
            name: label,
          },
        })).id,
      );

      if (id) return id;
    }

    return this.db.query(
      e
        .insert(e.Contact, {
          address,
          label,
        })
        .unlessConflict((c) => ({
          on: e.tuple([c.user, c.address]),
          else: e.update(c, () => ({ set: { label } })),
        })).id,
    );
  }

  async delete(address: Address) {
    return this.db.query(e.delete(e.Contact, uniqueContact(address)).id);
  }

  async label(address: Address) {
    const contact = e.select(e.Contact, () => ({
      filter_single: { user: e.global.current_user, address },
      label: true,
    })).label;

    const accountLabel = e.select(e.Account, () => ({
      filter_single: { address },
      label: true,
    })).label;
    const account = e.op(
      e.op(accountLabel, '++', CONFIG.ensSuffix),
      'if',
      e.op('exists', accountLabel),
      'else',
      e.cast(e.str, e.set()),
    );

    const approver = e.select(e.Approver, () => ({
      filter_single: { address },
      label: true,
    })).label;

    const token = e.assert_single(
      e.select(e.Token, (t) => ({
        filter: e.op(t.address, '=', address),
        limit: 1,
        name: true,
      })).name,
    );

    const r = await this.db.query(
      e.select(e.op(e.op(e.op(contact, '??', account), '??', approver), '??', token)),
    );

    return r ?? this.hardcodedContracts[address];
  }
}
