import { ArgsType, InputType } from '@nestjs/graphql';
import { WalletRef, Address, Quorum } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { Bytes4Field } from '~/apollo/scalars/Bytes4.scalar';
import { QuorumsField } from '~/apollo/scalars/Quorum.scalar';

@InputType()
export class WalletId {
  @AddressField()
  accountId: Address;

  @Bytes4Field()
  ref: WalletRef;
}

@ArgsType()
export class WalletArgs {
  id: WalletId;
}

@ArgsType()
export class SetWalletNameArgs {
  id: WalletId;

  name: string;
}

@ArgsType()
export class SetQuorumsArgs {
  id: WalletId;

  @QuorumsField()
  quorums: Quorum[];

  @Bytes32Field()
  txHash: string;
}

@ArgsType()
export class UpsertWalletArgs {
  id: WalletId;

  name?: string;

  @QuorumsField()
  quorums: Quorum[];

  @Bytes32Field()
  proposalHash: string;
}

@ArgsType()
export class RemoveWalletArgs {
  id: WalletId;

  @Bytes32Field({ nullable: true })
  proposalHash?: string;
}
