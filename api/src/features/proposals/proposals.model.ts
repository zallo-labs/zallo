import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { Account } from '../accounts/accounts.model';
import { Policy } from '../policies/policies.model';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Transaction } from '../transactions/transactions.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Operation } from '../operations/operations.model';
import { Approver } from '../approvers/approvers.model';
import { Token } from '../tokens/tokens.model';
import { Simulation } from '../simulations/simulations.model';

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

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Approver)
  proposedBy: Approver;

  @Field(() => [ProposalResponse])
  responses: ProposalResponse[];

  @Field(() => [Approval])
  approvals: Approval[];

  @Field(() => [Rejection])
  rejections: Rejection[];
}

@ObjectType()
export class TransactionProposal extends Proposal {
  @Field(() => [Operation])
  operations: Operation[];

  @Field(() => GraphQLBigInt)
  nonce: bigint;

  @Field(() => GraphQLBigInt)
  gasLimit: bigint;

  @Field(() => Token)
  feeToken: Token;

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

  @Field(() => Approver)
  approver: Approver;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class Approval extends ProposalResponse {
  // Don't include signature as user's may want to retract it later
}

@ObjectType()
export class Rejection extends ProposalResponse {}
