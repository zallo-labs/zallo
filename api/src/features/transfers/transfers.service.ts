import { Injectable } from '@nestjs/common';
import { TransfersInput } from './transfers.input';
import { DatabaseService } from '../database/database.service';
import e, { $infer } from '~/edgeql-js';
import { and } from '../database/database.util';
import { ShapeFunc } from '../database/database.select';
import { selectAccount } from '../accounts/accounts.util';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Shape } from '../database/database.select';

export const TRANSFER_VALUE_FIELDS_SHAPE = {
  token: true,
  amount: true,
  direction: true,
} satisfies Shape<typeof e.TransferDetails>;
const s = e.select(e.TransferDetails, () => TRANSFER_VALUE_FIELDS_SHAPE);
export type TransferValueSelectFields = $infer<typeof s>[0];

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

  async select(
    { accounts, direction, external }: TransfersInput,
    shape?: ShapeFunc<typeof e.Transfer>,
  ) {
    return this.db.query(
      e.select(e.Transfer, (t) => ({
        ...shape?.(t),
        filter: and(
          accounts && e.op(t.account, 'in', e.set(...accounts.map((a) => selectAccount(a)))),
          direction && e.op(t.direction, '=', e.cast(e.TransferDirection, direction)),
          external !== undefined && external
            ? e.op('not', e.op('exists', t.transaction))
            : e.op('exists', t.transaction),
        ),
      })),
    );
  }

  async value(f: TransferValueSelectFields): Promise<bigint> {
    const v = f.amount; // TODO: multiply by price

    return f.direction === 'In' ? v : -v;
  }
}
