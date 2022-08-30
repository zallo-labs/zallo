import { LimitPeriod } from '@gen/prisma/limit-period.enum';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { BigNumber } from 'ethers';
import { WalletRef, Address, Quorum } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { Bytes4Field } from '~/apollo/scalars/Bytes4.scalar';
import { QuorumsField } from '~/apollo/scalars/Quorum.scalar';
import { Uint256BnField } from '~/apollo/scalars/Uint256Bn.scalar';

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

@InputType()
export class Limit {
  @AddressField()
  token: Address;

  @Uint256BnField()
  amount: BigNumber;

  @Field(() => LimitPeriod)
  period: keyof typeof LimitPeriod;
}

@ArgsType()
export class UpsertWalletArgs {
  id: WalletId;

  @Bytes32Field()
  proposalHash: string;

  name?: string;

  @QuorumsField()
  quorums: Quorum[];

  spendingAllowlisted?: boolean;

  limits?: Limit[];
}

@ArgsType()
export class RemoveWalletArgs {
  id: WalletId;

  @Bytes32Field({ nullable: true })
  proposalHash?: string;
}
