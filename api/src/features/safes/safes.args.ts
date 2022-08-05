import { ArgsType, InputType } from '@nestjs/graphql';
import { AccountRef, Address, Quorums } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { Bytes4Field } from '~/apollo/scalars/Bytes4.scalar';
import { QuorumsField } from '~/apollo/scalars/Quorum.scalar';

@ArgsType()
export class SafeArgs {
  @AddressField()
  id: Address;
}

@ArgsType()
export class UpsertSafeArgs {
  @AddressField()
  safe: Address;

  @Bytes32Field({ nullable: true })
  deploySalt?: string;

  @AddressField()
  impl: Address;

  name: string;

  accounts?: AccountWithoutSafeInput[];
}

@InputType()
export class AccountWithoutSafeInput {
  @Bytes4Field()
  ref: AccountRef;

  @QuorumsField()
  quorums: Quorums;

  name: string;
}
