import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { SystemTx } from '../system-txs/system-tx.model';
import { Operation } from '../operations/operations.model';
import { Token } from '../tokens/tokens.model';
import { Simulation } from '../simulations/simulations.model';
import { Proposal } from '../proposals/proposals.model';
import { AddressField } from '~/common/scalars/Address.scalar';
import { Address } from 'lib';
import { DecimalField } from '~/common/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { CustomNode, CustomNodeType } from '~/common/decorators/interface.decorator';
import { PaymasterFees } from '../paymasters/paymasters.model';
import { Result } from '../system-txs/results.model';

@ObjectType({ implements: () => Proposal })
export class Transaction extends Proposal {
  @Field(() => [Operation])
  operations: Operation[];

  @Field(() => GraphQLBigInt)
  gasLimit: bigint;

  @Field(() => Token)
  feeToken: Token;

  @DecimalField()
  maxAmount: Decimal;

  @AddressField()
  paymaster: Address;

  @Field(() => PaymasterFees)
  paymasterEthFees: PaymasterFees;

  @Field(() => Simulation, { nullable: true })
  simulation?: Simulation;

  @Field(() => Boolean)
  executable: boolean;

  @Field(() => [SystemTx])
  systxs: SystemTx[];

  @Field(() => SystemTx, { nullable: true })
  systx?: SystemTx | null;

  @Field(() => [Result])
  results: Result[];

  @Field(() => Result, { nullable: true })
  result?: Result;

  @Field(() => TransactionStatus)
  status: TransactionStatus;
}

export enum TransactionStatus {
  Pending = 'Pending',
  Scheduled = 'Scheduled',
  Executing = 'Executing',
  Successful = 'Successful',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}
registerEnumType(TransactionStatus, { name: 'TransactionStatus' });

@CustomNodeType()
export class EstimatedTransactionFees extends CustomNode {
  @DecimalField()
  maxNetworkEthFee: Decimal;

  @Field(() => PaymasterFees)
  paymasterEthFees: PaymasterFees;
}
