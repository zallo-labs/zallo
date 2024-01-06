import { Subject } from 'rxjs';

import { Address, UAddress } from 'lib';
import { AddressesModalParams } from '~/app/addresses';
import { useGetEvent } from '~/hooks/useGetEvent';

export const ADDRESS_SELECTED = new Subject<Address | UAddress>();
export const useSelectAddress = () => {
  const getEvent = useGetEvent();

  return (params: AddressesModalParams = {}) =>
    getEvent({ pathname: `/addresses`, params }, ADDRESS_SELECTED);
};
