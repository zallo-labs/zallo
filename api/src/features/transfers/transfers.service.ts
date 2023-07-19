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
import { Address, BigIntlike } from 'lib';
import { formatUnits } from 'viem';

export const TRANSFER_VALUE_FIELDS_SHAPE = {
  token: {
    address: true,
    ethereumAddress: true,
    decimals: true,
  },
  amount: true,
  direction: true,
} satisfies Shape<typeof e.TransferDetails>;
const s = e.select(e.TransferDetails, () => TRANSFER_VALUE_FIELDS_SHAPE);
export type TransferValueSelectFields = $infer<typeof s>[0];

const FIAT_DECIMALS = 8;
const fiatAsBigInt = (value: number): bigint => BigInt(Math.floor(value * 10 ** FIAT_DECIMALS));

export interface TokenValueOptions {
  amount: BigIntlike;
  decimals: number;
  price: number;
}

export function getTokenValue({ amount, decimals, price }: TokenValueOptions): number {
  return parseFloat(formatUnits(BigInt(amount) * fiatAsBigInt(price), decimals + FIAT_DECIMALS));
}

@Injectable()
export class TransfersService {
  constructor(private db: DatabaseService, private prices: PricesService) {}

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

  async value({ token, amount, direction }: TransferValueSelectFields): Promise<number | null> {
    if (!token) return null;

    const p = await this.prices.price(
      token.address as Address,
      token.ethereumAddress as Address | undefined,
    );
    if (!p) return null;

    const value = getTokenValue({ amount, decimals: token.decimals, price: p.current });

    return direction === 'In' ? value : -value;
  }
}
