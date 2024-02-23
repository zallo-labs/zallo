import { Hex, UUID, isHex } from 'lib';
import e from '~/edgeql-js';

export function selectSysTx(id: UUID | Hex) {
  return e.select(e.SystemTx, () => ({ filter_single: isHex(id) ? { hash: id } : { id } }));
}
