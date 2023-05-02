import { Field, ObjectType, OmitType } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { GraphQLBigInt } from 'graphql-scalars';
import { PolicyKey } from 'lib';
import { GraphQLDecimal } from 'prisma-graphql-type-decimal';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { Account } from '../accounts/accounts.model';
import { User } from '../users/users.model';
import { PolicyState } from '../policies/policies.model';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field, BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Transaction } from '../transactions/transactions.model';

@ObjectType()
export class Proposal {
  @Bytes32Field()
  id: string; // Hex

  @Field(() => Account, { nullable: false })
  account?: Account;

  @AddressField()
  accountId: string; // Address

  @Field(() => User, { nullable: false })
  proposer?: User;

  @AddressField()
  proposerId: string; // Address

  @AddressField()
  to: string; // Address

  @Field(() => GraphQLDecimal, { nullable: true })
  value: Decimal | null;

  @BytesField({ nullable: true })
  data: string | null; // Hex | null

  @Field(() => GraphQLBigInt)
  nonce: bigint;

  @Field(() => GraphQLBigInt, { nullable: true })
  gasLimit: bigint | null;

  @Field(() => GraphQLBigInt)
  estimatedOpGas: bigint;

  @AddressField()
  feeToken: string | null; // Address | null

  createdAt: Date;

  simulation?: Simulation | null;

  approvals?: Approval[];

  transactions?: Transaction[];

  policyStates?: PolicyState[];
}

@ObjectType()
export class Simulation {
  @Field(() => Proposal, { nullable: false })
  proposal?: Proposal;

  @Bytes32Field()
  proposalId: string; // Hex

  transfers?: SimulatedTransfer[];
}

@ObjectType()
export class SimulatedTransfer {
  id: number;

  @Field(() => Simulation, { nullable: false })
  simulation?: Simulation;

  @Bytes32Field()
  proposalId: string; // Hex

  @AddressField()
  token: string; // Address

  @AddressField()
  from: string; // Address

  @AddressField()
  to: string; // Address

  @Field(() => GraphQLDecimal)
  amount: Decimal;
}

@ObjectType()
export class Approval {
  @Field(() => Proposal, { nullable: false })
  proposal?: Proposal;

  @Bytes32Field()
  proposalId: string; // Hex

  @Field(() => User, { nullable: false })
  user?: User;

  @AddressField()
  userId: string; // Address

  @BytesField()
  signature: string | null; // Hex | null

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class Rejection extends OmitType(Approval, ['signature'] as const) {}

@ObjectType()
export class SatisfiablePolicy {
  id: string;

  @PolicyKeyField()
  key: PolicyKey;

  satisfied: boolean;

  requiresUserAction: boolean;
}
