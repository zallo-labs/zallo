import { Address } from 'lib';
import { Subject } from 'rxjs';
import { useGetEvent } from '~/hooks/useGetEvent';
import { AddressesModalParams } from '~/screens/addresses/AddressesModal';

export const ADDRESS_SELECTED = new Subject<Address>();
export const useSelectAddress = () => {
  const getEvent = useGetEvent();

  return (params: AddressesModalParams = {}) =>
    getEvent({ pathname: `/addresses`, params }, ADDRESS_SELECTED);
};
