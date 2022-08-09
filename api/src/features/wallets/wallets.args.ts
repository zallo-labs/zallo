import { ArgsType, InputType } from '@nestjs/graphql';
import { WalletRef, Address, Quorums } from 'lib';
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
export class SetWalletNameArgs {
  id: WalletId;

  name: string;
}

@ArgsType()
export class SetQuorumsArgs {
  id: WalletId;

  @QuorumsField()
  quorums: Quorums;

  @Bytes32Field()
  txHash: string;
}

@ArgsType()
export class DeleteWalletArgs {
  id: WalletId;
}
