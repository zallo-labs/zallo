import { Address } from 'lib';
import { EventEmitter } from '~/util/EventEmitter';

export const ADDRESS_EMITTER = new EventEmitter<Address>('Address');
export const useSelectAddress = ADDRESS_EMITTER.createUseSelect('AddressesModal');
