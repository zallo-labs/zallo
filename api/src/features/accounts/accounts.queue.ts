import { BullModuleOptions } from '@nestjs/bull';
import { Address, Hex } from 'lib';

export const ACCOUNTS_QUEUE = {
  name: 'Accounts',
} satisfies BullModuleOptions;

export interface AccountActivationEvent {
  account: Address;
  transaction: Hex;
}
