import { Injectable } from '@nestjs/common';
import { TransfersInput } from './transfers.input';
import { DatabaseService } from '../database/database.service';
import e, { $infer } from '~/edgeql-js';
import { and } from '../database/database.util';
import { ShapeFunc } from '../database/database.select';
import { selectAccount } from '../accounts/accounts.util';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Shape } from '../database/database.select';
import { PricesService } from '../prices/prices.service';
import { asHex, asDecimal } from 'lib';
import Decimal from 'decimal.js';

export const TRANSFER_VALUE_FIELDS_SHAPE = {
  token: { pythUsdPriceId: true },
  amount: true,
} satisfies Shape<typeof e.TransferDetails>;
const s = e.select(e.TransferDetails, () => TRANSFER_VALUE_FIELDS_SHAPE);
export type TransferValueSelectFields = $infer<typeof s>[0];

@Injectable()
export class TransfersService {
  constructor(
    private db: DatabaseService,
    private prices: PricesService,
  ) {}

  async selectUnique(id: uuid, shape?: ShapeFunc<typeof e.Transfer>) {
    return this.db.query(
      e.select(e.Transfer, (transfer) => ({
        filter_single: { id },
        ...shape?.(transfer),
      })),
    );
  }

  async select(
    { accounts, direction, internal }: TransfersInput,
    shape?: ShapeFunc<typeof e.Transfer>,
  ) {
    return this.db.query(
      e.select(e.Transfer, (t) => ({
        ...shape?.(t),
        filter: and(
          accounts && e.op(t.account, 'in', e.set(...accounts.map((a) => selectAccount(a)))),
          internal !== undefined && e.op(t.internal, '=', internal),
          direction && e.op(e.cast(e.TransferDirection, direction), 'in', t.direction),
        ),
      })),
    );
  }

  async value({ token, amount }: TransferValueSelectFields): Promise<Decimal | null> {
    const pythUsdPriceId = token?.pythUsdPriceId;
    if (!pythUsdPriceId) return null;

    const usdPrice = await this.prices.usd(asHex(pythUsdPriceId));
    if (!usdPrice) return null;

    return new Decimal(amount).mul(usdPrice.current);
  }
}
