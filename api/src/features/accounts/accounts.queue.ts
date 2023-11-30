import { BullModuleOptions } from '@nestjs/bull';
import { Hex, UAddress } from 'lib';

export const ACCOUNTS_QUEUE = {
  name: 'Accounts',
} satisfies BullModuleOptions;

export interface AccountActivationEvent {
  account: UAddress;
  transaction: Hex;
}
