import { Injectable } from '@nestjs/common';
import { TransfersInput } from './transfers.input';
import { DatabaseService } from '~/core/database';
import e, { $infer } from '~/edgeql-js';
import { and } from '~/core/database';
import { ShapeFunc } from '~/core/database';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Shape } from '~/core/database';
import { PricesService } from '../prices/prices.service';
import { UUID, asHex } from 'lib';
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
    return this.db.queryWith(
      { id: e.uuid },
      ({ id }) =>
        e.select(e.Transfer, (transfer) => ({
          filter_single: { id },
          ...shape?.(transfer),
        })),
      { id },
    );
  }

  async select(
    account: UUID,
    { direction, internal }: TransfersInput,
    shape?: ShapeFunc<typeof e.Transfer>,
  ) {
    return this.db.queryWith(
      { account: e.uuid, direction: e.optional(e.TransferDirection), internal: e.optional(e.bool) },
      ({ account, direction, internal }) =>
        e.select(e.Transfer, (t) => ({
          ...shape?.(t),
          filter: and(
            e.op(t.account, '=', e.cast(e.Account, account)),
            e.op(e.op(t.internal, '=', internal), 'if', e.op('exists', internal), 'else', true),
            e.op(e.op(direction, 'in', t.direction), 'if', e.op('exists', direction), 'else', true),
          ),
        })),
      { account, direction, internal },
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
