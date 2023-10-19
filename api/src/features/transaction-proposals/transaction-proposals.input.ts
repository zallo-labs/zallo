import { Field, InputType } from '@nestjs/graphql';
import { Address, Hex, PolicyKey } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { Uint256Field } from '~/apollo/scalars/BigInt.scalar';
import { BytesField, BytesScalar } from '~/apollo/scalars/Bytes.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { TransactionProposalStatus } from './transaction-proposals.model';
import { ProposalInput } from '../proposals/proposals.input';

@InputType()
export class TransactionProposalsInput {
  @Field(() => [AddressScalar], { nullable: true })
  accounts?: Address[];

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
  @AddressField()
  account: Address;

  @Field(() => [OperationInput])
  operations: OperationInput[];

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => String, { nullable: true })
  iconUri?: string;

  @Field(() => Date, { nullable: true })
  validFrom?: Date;

  @Uint256Field({ nullable: true })
  gasLimit?: bigint;

  @AddressField({ nullable: true })
  feeToken?: Address;

  @Field(() => BytesScalar, { nullable: true, description: 'Approve the proposal' })
  signature?: Hex;
}

@InputType()
export class UpdateTransactionProposalInput extends ProposalInput {
  @PolicyKeyField({ nullable: true })
  policy?: PolicyKey | null;

  @AddressField({ nullable: true })
  feeToken?: Address;
}
