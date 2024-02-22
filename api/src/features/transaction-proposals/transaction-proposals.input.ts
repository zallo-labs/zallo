import { Field, InputType, OmitType } from '@nestjs/graphql';
import { Address, Hex, PolicyKey, UAddress, UUID } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Uint256Field } from '~/apollo/scalars/BigInt.scalar';
import { BytesField, BytesScalar } from '~/apollo/scalars/Bytes.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { TransactionProposalStatus } from './transaction-proposals.model';
import { DappMetadataInput, UniqueProposalInput } from '../proposals/proposals.input';
import { UAddressField, UAddressScalar } from '~/apollo/scalars/UAddress.scalar';
import { UUIDField } from '~/apollo/scalars/Uuid.scalar';

@InputType()
export class TransactionProposalsInput {
  @Field(() => [UAddressScalar], { nullable: true })
  accounts?: UAddress[];

  @Field(() => [TransactionProposalStatus], { nullable: true })
  statuses?: TransactionProposalStatus[];
}

@InputType()
export class OperationInput {
  @AddressField()
  to: Address;

  @Uint256Field({ nullable: true })
  value?: bigint;

  @BytesField({ nullable: true })
  data?: Hex;
}

@InputType()
export class ProposeTransactionInput {
  @UAddressField()
  account: UAddress;

  @Field(() => [OperationInput])
  operations: [OperationInput, ...OperationInput[]];

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => String, { nullable: true })
  iconUri?: string;

  @Field(() => DappMetadataInput, { nullable: true })
  dapp?: DappMetadataInput;

  @Field(() => Date, { nullable: true })
  validFrom?: Date;

  @Uint256Field({ nullable: true })
  gas?: bigint;

  @AddressField({ nullable: true })
  feeToken?: Address;

  @Field(() => BytesScalar, { nullable: true, description: 'Approve the proposal' })
  signature?: Hex;
}

@InputType()
export class ProposeCancelScheduledTransactionInput extends OmitType(ProposeTransactionInput, [
  'operations',
]) {
  @UUIDField()
  proposal: UUID;
}

@InputType()
export class UpdateTransactionProposalInput extends UniqueProposalInput {
  @PolicyKeyField({ nullable: true })
  policy?: PolicyKey | null;

  @AddressField({ nullable: true })
  feeToken?: Address;
}

@InputType()
export class ExecuteTransactionProposalInput extends UniqueProposalInput {
  @Field(() => Boolean, { nullable: true })
  ignoreSimulation?: boolean;
}
