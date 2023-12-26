import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { Transaction } from '../transactions/transactions.model';
import { Operation } from '../operations/operations.model';
import { Token } from '../tokens/tokens.model';
import { Simulation } from '../simulations/simulations.model';
import { Proposal } from '../proposals/proposals.model';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Address } from 'lib';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { CustomNode, CustomNodeType, Node, NodeType } from '~/decorators/interface.decorator';

@ObjectType({ implements: () => Proposal })
export class TransactionProposal extends Proposal {
  @Field(() => [Operation])
  operations: Operation[];

  @Field(() => GraphQLBigInt)
  nonce: bigint;

  @Field(() => GraphQLBigInt)
  gasLimit: bigint;

  @Field(() => Token)
  feeToken: Token;

  @AddressField()
  paymaster: Address;

  @DecimalField()
  paymasterEthFee: Decimal;

  @Field(() => Simulation, { nullable: true })
  simulation?: Simulation;

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

@CustomNodeType()
export class EstimatedTransactionFees extends CustomNode {
  @DecimalField()
  maxNetworkEthFee: Decimal;

  @DecimalField()
  ethDiscount: Decimal;
}
