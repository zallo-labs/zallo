import e, { Set } from '~/edgeql-js';
import { $ } from 'edgedb';
import { $UAddress } from '~/edgeql-js/modules/default';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Address, UAddress, isUAddress } from 'lib';

export const selectAccount = <Id extends uuid | UAddress>(id: Id extends Address ? never : Id) =>
  e.select(e.Account, () => ({ filter_single: isUAddress(id) ? { address: id } : { id } }));

export type SelectedAccount = ReturnType<typeof selectAccount>;

export const selectAccount2 = (address: Set<$UAddress, $.Cardinality.One>) =>
  e.select(e.Account, () => ({ filter_single: { address } }));
