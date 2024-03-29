import { Address, UAddress } from 'lib';
import { Subject } from 'rxjs';
import { AddressesModalParams } from '~/app/(drawer)/addresses';
import { useGetEvent } from '~/hooks/useGetEvent';

export const ADDRESS_SELECTED = new Subject<Address | UAddress>();
export const useSelectAddress = () => {
  const getEvent = useGetEvent();

  return (params: AddressesModalParams = {}) =>
    getEvent({ pathname: `/(drawer)/addresses`, params }, ADDRESS_SELECTED);
};
