import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { PolicyKey } from 'lib';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { Account } from '../accounts/accounts.model';
import { User } from '../users/users.model';
import { Policy } from '../policies/policies.model';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field, BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Transaction } from '../transactions/transactions.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { TransferDetails } from '../transfers/transfers.model';
import { uuid } from 'edgedb/dist/codecs/ifaces';

@ObjectType({ isAbstract: true })
export class Proposal {
  @IdField()
  id: uuid;

  @Bytes32Field()
  hash: string; // Hex

  account: Account;

  policy?: Policy | null;

  createdAt: Date;

  proposedBy: User;

  responses: ProposalResponse[];

  approvals: Approval[];

  rejections: Rejection[];
}

@ObjectType()
export class TransactionProposal extends Proposal {
  @AddressField()
  to: uuid; // Address

  @Field(() => GraphQLBigInt, { nullable: true })
  value?: bigint | null;

  @BytesField({ nullable: true })
  data?: string | null; // Hex | null

  @Field(() => GraphQLBigInt)
  nonce: bigint;

  @Field(() => GraphQLBigInt)
  gasLimit: bigint;

  @AddressField()
  feeToken: string; // Address

  simulation: Simulation;

  transactions: Transaction[];

  transaction?: Transaction | null;

  status: TransactionProposalStatus;
}

export enum TransactionProposalStatus {
  Pending = 'Pending',
  Executing = 'Executing',
  Successful = 'Successful',
  Failed = 'Failed',
}
registerEnumType(TransactionProposalStatus, { name: 'TransactionProposalStatus' });

@ObjectType()
export class Simulation {
  @IdField()
  id: uuid;

  transfers: TransferDetails[];
}

@ObjectType({ isAbstract: true })
export class ProposalResponse {
  @IdField()
  id: uuid;

  proposal: Proposal;

  user: User;

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

  satisfied: boolean;

  requiresUserAction: boolean;
}
