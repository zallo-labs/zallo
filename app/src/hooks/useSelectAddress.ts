import { Address, UAddress } from 'lib';
import { Subject } from 'rxjs';
import { SelectAddressSheetParams } from '~/app/(sheet)/select/address';
import { useGetEvent } from '~/hooks/useGetEvent';

export const ADDRESS_SELECTED = new Subject<Address | UAddress>();
export function useSelectAddress() {
  const getEvent = useGetEvent();

  return (params: SelectAddressSheetParams) =>
    getEvent({ pathname: `/(sheet)/select/address`, params }, ADDRESS_SELECTED);
}
