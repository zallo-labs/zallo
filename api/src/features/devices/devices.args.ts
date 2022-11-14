import { ArgsType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@ArgsType()
export class DeviceArgs {
  @AddressField({ nullable: true })
  addr?: Address;
}

@ArgsType()
export class SetDeviceNameArgs {
  name: string | null;
}

@ArgsType()
export class RegisterPushTokenArgs {
  token: string;
}
