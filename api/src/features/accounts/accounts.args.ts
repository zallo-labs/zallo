import { ArgsType, InputType } from '@nestjs/graphql';
import { AccountRef, Address, Quorums } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes4Field } from '~/apollo/scalars/Bytes4.scalar';
import { QuorumsField } from '~/apollo/scalars/Quorum.scalar';

@InputType()
export class AccountInput {
  @Bytes4Field()
  ref: AccountRef;

  @QuorumsField()
  quorums: Quorums;

  name?: string;
}

@ArgsType()
export class UpsertAccountArgs {
  @AddressField()
  safe: Address;

  account: AccountInput;
}
