import { ArgsType, InputType } from '@nestjs/graphql';
import { WalletRef, Address, Quorums } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { Bytes4Field } from '~/apollo/scalars/Bytes4.scalar';
import { QuorumsField } from '~/apollo/scalars/Quorum.scalar';

@ArgsType()
export class AccountArgs {
  @AddressField()
  id: Address;
}

@ArgsType()
export class UpsertAccountArgs {
  @AddressField()
  account: Address;

  @Bytes32Field({ nullable: true })
  deploySalt?: string;

  @AddressField()
  impl: Address;

  name: string;

  wallets?: WalletWithoutAccountInput[];
}

@InputType()
export class WalletWithoutAccountInput {
  @Bytes4Field()
  ref: WalletRef;

  @QuorumsField()
  quorums: Quorums;

  name: string;
}
