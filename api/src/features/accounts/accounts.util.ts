import e from '~/edgeql-js';
import { Address, isAddress } from 'lib';
import { uuid } from 'edgedb/dist/codecs/ifaces';

export const selectAccount = (id: uuid | Address) =>
  e.select(e.Account, () => ({ filter_single: isAddress(id) ? { address: id } : { id } }));

export type SelectedAccount = ReturnType<typeof selectAccount>;
