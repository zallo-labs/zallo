import { FindManyProposalArgs } from '@gen/proposal/find-many-proposal.args';
import { ArgsType, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql';
import { BigNumber, BytesLike } from 'ethers';
import { Address, TxSalt, ZERO } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { AddressSetField, NonEmptyAddressSetField } from '~/apollo/scalars/AddressSet.scalar';
import { BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { Bytes8Field } from '~/apollo/scalars/Bytes8.scalar';
import { Uint256BnField } from '~/apollo/scalars/Uint256Bn.scalar';

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

@ArgsType()
export class ProposalsArgs extends FindManyProposalArgs {
  @AddressSetField({ nullable: true })
  accounts?: Set<Address>;

  status?: ProposalStatus;
}

@ArgsType()
export class ProposeArgs {
  @AddressField()
  account: Address;

  // Defaults to the config with the least amount of approvers, followed by the lowest id (by lexical comparison)
  config?: number;

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
  @NonEmptyAddressSetField()
  approvers: Set<Address>;
}
