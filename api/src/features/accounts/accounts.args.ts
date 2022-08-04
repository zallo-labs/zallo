import { ArgsType, InputType } from '@nestjs/graphql';
import { AccountRef, Address, Quorums } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { Bytes4Field } from '~/apollo/scalars/Bytes4.scalar';
import { QuorumsField } from '~/apollo/scalars/Quorum.scalar';

@InputType()
export class AccountId {
  @AddressField()
  safeId: Address;

  @Bytes4Field()
  ref: AccountRef;
}

@ArgsType()
export class SetAccountNameArgs {
  id: AccountId;

  name: string;
}

@ArgsType()
export class SetQuorumsArgs {
  id: AccountId;

  @QuorumsField()
  quorums: Quorums;

  @Bytes32Field()
  txHash: string;
}

@ArgsType()
export class DeleteAccountArgs {
  id: AccountId;
}
