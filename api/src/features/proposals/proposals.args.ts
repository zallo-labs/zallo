import { FindManyProposalArgs } from '@gen/proposal/find-many-proposal.args';
import { ArgsType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BigNumber, BytesLike } from 'ethers';
import { Address, QuorumKey, TxSalt, ZERO } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { QuorumKeyField, Uint256BnField } from '~/apollo/scalars/BigNumber.scalar';
import {
  Bytes32Field,
  Bytes32Scalar,
  Bytes8Field,
  BytesField,
} from '~/apollo/scalars/Bytes.scalar';
import { SetField } from '~/apollo/scalars/SetField';

@ArgsType()
export class UniqueProposalArgs {
  @Bytes32Field()
  id: string;
}

export enum ProposalStatus {
  AwaitingUser = 'awaiting-user',
  AwaitingOther = 'awaiting-other',
  Executed = 'executed',
}
registerEnumType(ProposalStatus, { name: 'ProposalStatus' });

export enum ProposalState {
  Pending = 'pending',
  Executing = 'executing',
  Executed = 'executed',
}
registerEnumType(ProposalState, { name: 'ProposalState' });

@ArgsType()
export class ProposalsArgs extends FindManyProposalArgs {
  // Only show the specified accounts
  @SetField(() => AddressScalar, { nullable: true })
  accounts?: Set<Address>;

  state?: ProposalState;

  userHasApproved?: boolean;
}

@ArgsType()
export class ProposalModifiedArgs {
  @SetField(() => AddressScalar, { nullable: true })
  accounts?: Set<Address>;

  @SetField(() => Bytes32Scalar, { nullable: true })
  ids?: Set<string>;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  created: boolean;
}

@ArgsType()
export class ProposeArgs {
  @AddressField()
  account: Address;

  // Defaults to quorum with the least amount of approvers, followed by the lowest id (by lexical comparison)
  @QuorumKeyField({ nullable: true })
  quorumKey?: QuorumKey;

  @AddressField()
  to: Address;

  // Wei
  @Uint256BnField({ nullable: true, defaultValue: ZERO })
  value: BigNumber;

  @BytesField({ nullable: true, defaultValue: '0x' })
  data: string;

  @Bytes8Field({ nullable: true })
  salt?: TxSalt;

  @Uint256BnField({ nullable: true })
  gasLimit?: BigNumber;
}

@ArgsType()
export class ApproveArgs extends UniqueProposalArgs {
  @BytesField()
  signature: string;
}

@ObjectType()
export class ApprovalResponse {
  @BytesField({ nullable: true })
  transactionHash?: BytesLike;
}

@ArgsType()
export class ApprovalRequest extends UniqueProposalArgs {
  @SetField(() => AddressScalar, { min: 1 })
  approvers: Set<Address>;
}
