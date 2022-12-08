import { FindManyAccountArgs } from '@gen/account/find-many-account.args';
import { ArgsType, Field } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { minLengthMiddleware } from '~/apollo/scalars/util';
import { QuorumInput } from '../quorums/quorums.args';

@ArgsType()
export class AccountArgs {
  @AddressField()
  id: Address;
}

@ArgsType()
export class AccountsArgs extends FindManyAccountArgs {}

@ArgsType()
export class CreateAccountArgs {
  name: string;

  @Field(() => [QuorumInput], { middleware: [minLengthMiddleware(1)] })
  qurorums: QuorumInput[];
}

@ArgsType()
export class SetAccountNameArgs extends AccountArgs {
  name: string;
}
