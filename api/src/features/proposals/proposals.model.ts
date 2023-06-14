import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { PolicyKey } from 'lib';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { Account } from '../accounts/accounts.model';
import { User } from '../users/users.model';
import { Policy } from '../policies/policies.model';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Transaction } from '../transactions/transactions.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { TransferDetails } from '../transfers/transfers.model';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Operation } from '../operations/operations.model';

@ObjectType({ isAbstract: true })
export class Proposal {
  @IdField()
  id: uuid;

  @Bytes32Field()
  hash: string; // Hex

  @Field(() => Account)
  account: Account;

  @Field(() => Policy, { nullable: true })
  policy?: Policy | null;

  @Field(() => String)
  label: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => User)
  proposedBy: User;

  @Field(() => [ProposalResponse])
  responses: ProposalResponse[];

  @Field(() => [Approval])
  approvals: Approval[];

  @Field(() => [Rejection])
  rejections: Rejection[];
}

@ObjectType()
export class Simulation {
  @IdField()
  id: uuid;

  @Field(() => [TransferDetails])
  transfers: TransferDetails[];
}

@ObjectType()
export class TransactionProposal extends Proposal {
  @Field(() => [Operation])
  operations: Operation[];

  @Field(() => GraphQLBigInt)
  nonce: bigint;

  @Field(() => GraphQLBigInt)
  gasLimit: bigint;

  @AddressField()
  feeToken: string; // Address

  @Field(() => Simulation)
  simulation: Simulation;

  @Field(() => [Transaction])
  transactions: Transaction[];

  @Field(() => Transaction, { nullable: true })
  transaction?: Transaction | null;

  @Field(() => TransactionProposalStatus)
  status: TransactionProposalStatus;
}

export enum TransactionProposalStatus {
  Pending = 'Pending',
  Executing = 'Executing',
  Successful = 'Successful',
  Failed = 'Failed',
}
registerEnumType(TransactionProposalStatus, { name: 'TransactionProposalStatus' });

@ObjectType({ isAbstract: true })
export class ProposalResponse {
  @IdField()
  id: uuid;

  @Field(() => Proposal)
  proposal: Proposal;

  @Field(() => User)
  user: User;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class Approval extends ProposalResponse {
  // Don't include signature as user's may want to retract it later
}

@ObjectType()
export class Rejection extends ProposalResponse {}

@ObjectType()
export class SatisfiablePolicy {
  @IdField()
  id: uuid;

  @PolicyKeyField()
  key: PolicyKey;

  @Field(() => Boolean)
  satisfied: boolean;

  @Field(() => Boolean)
  responseRequested: boolean;
}
