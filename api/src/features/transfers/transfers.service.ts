import { Injectable } from '@nestjs/common';
import { TransfersInput } from './transfers.input';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { and } from '../database/database.util';
import { ShapeFunc } from '../database/database.select';

@Injectable()
export class TransfersService {
  constructor(private db: DatabaseService) {}

  async transfers({ accounts, direction }: TransfersInput, shape?: ShapeFunc<typeof e.Transfer>) {
    return this.db.query(
      e.select(e.Transfer, (t) => ({
        ...shape?.(t),
        filter: and(
          accounts && e.op(t.account.address, 'in', e.set(...accounts)),
          direction && e.op(t.direction, '=', e.cast(e.TransferDirection, direction)),
        ),
      })),
    );
  }
}
