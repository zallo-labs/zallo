import { FindManyProposalArgs } from '@gen/proposal/find-many-proposal.args';
import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
} from '@nestjs/graphql';
import { BigNumber, BytesLike } from 'ethers';
import { Address, Id, TxSalt } from 'lib';
import { AddressField, GqlAddress } from '~/apollo/scalars/Address.scalar';
import { BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { Bytes8Field } from '~/apollo/scalars/Bytes8.scalar';
import { Uint256BnField } from '~/apollo/scalars/Uint256Bn.scalar';

@ArgsType()
export class UniqueProposalArgs {
  @Bytes32Field()
  hash: string;
}

@ArgsType()
export class ProposalsArgs extends OmitType(FindManyProposalArgs, [
  'where' as const,
]) {
  @Field(() => [GqlAddress], { nullable: true })
  accounts?: Address[];
}

@InputType()
export class ProposalInput {
  @AddressField()
  to: Address;

  @Uint256BnField()
  value: BigNumber;

  @BytesField()
  data: BytesLike;

  @Bytes8Field()
  salt: TxSalt;

  @Uint256BnField({ nullable: true })
  gasLimit?: BigNumber;
}

@ArgsType()
export class ProposeArgs {
  @AddressField()
  account: Address;

  proposal: ProposalInput;

  @BytesField()
  signature: string;
}

@ObjectType()
export class RevokeApprovalResp {
  @Field(() => String, { nullable: true })
  id?: Id;
}

@ArgsType()
export class ApproveArgs extends UniqueProposalArgs {
  @BytesField()
  signature: BytesLike;
}
