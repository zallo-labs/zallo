import { Injectable } from '@nestjs/common';
import { TransfersInput } from './transfers.input';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { and } from '../database/database.util';
import { ShapeFunc } from '../database/database.select';
import { selectAccount } from '../accounts/accounts.util';
import { uuid } from 'edgedb/dist/codecs/ifaces';

@Injectable()
export class TransfersService {
  constructor(private db: DatabaseService) {}

  async selectUnique(id: uuid, shape?: ShapeFunc<typeof e.Transfer>) {
    return this.db.query(
      e.select(e.Transfer, (transfer) => ({
        filter_single: { id },
        ...shape?.(transfer),
      })),
    );
  }

  async select({ accounts, direction }: TransfersInput, shape?: ShapeFunc<typeof e.Transfer>) {
    return this.db.query(
      e.select(e.Transfer, (t) => ({
        ...shape?.(t),
        filter: and(
          accounts && e.op(t.account, 'in', e.set(...accounts.map((a) => selectAccount(a)))),
          direction && e.op(t.direction, '=', e.cast(e.TransferDirection, direction)),
        ),
      })),
    );
  }
}
