import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetAddrNameArgs {
  @Field(() => String, { nullable: false })
  addr!: string;
}

@ArgsType()
export class SetDeviceNameArgs {
  name: string | null;
}

@ArgsType()
export class RegisterPushTokenArgs {
  token: string;
}
