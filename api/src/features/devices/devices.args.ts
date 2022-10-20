import { ArgsType, Field } from '@nestjs/graphql';
import { Matches } from 'class-validator';

@ArgsType()
export class GetAddrNameArgs {
  @Field(() => String, { nullable: false })
  addr!: string;
}

@ArgsType()
export class RegisterPushTokenArgs {
  @Matches(/ExponentPushToken\[.+\]/)
  token: string;
}
