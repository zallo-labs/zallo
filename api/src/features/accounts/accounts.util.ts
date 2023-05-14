import e from '~/edgeql-js';
import { Address, isAddress } from 'lib';
import { ShapeFunc } from '../database/database.select';
import { uuid } from 'edgedb/dist/codecs/ifaces';

export const selectAccount = (id: uuid | Address, shape?: ShapeFunc<typeof e.Account>) =>
  e.select(e.Account, (a) => ({
    ...shape?.(a),
    filter_single: isAddress(id) ? { address: id } : { id },
  }));
