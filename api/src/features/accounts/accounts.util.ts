import e from '~/edgeql-js';
import { Address, UAddress, isUAddress } from 'lib';
import { uuid } from 'edgedb/dist/codecs/ifaces';

export const selectAccount = <Id extends uuid | UAddress>(id: Id extends Address ? never : Id) =>
  e.select(e.Account, () => ({ filter_single: isUAddress(id) ? { address: id } : { id } }));

export type SelectedAccount = ReturnType<typeof selectAccount>;
