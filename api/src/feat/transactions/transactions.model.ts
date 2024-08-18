import { Field, ObjectType, PickType, registerEnumType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { SystemTx } from '../system-txs/system-tx.model';
import { Operation } from '../operations/operations.model';
import { Token } from '../tokens/tokens.model';
import { Proposal } from '../proposals/proposals.model';
import { AddressField } from '~/common/scalars/Address.scalar';
import { Address, PolicyKey, UAddress } from 'lib';
import { DecimalField } from '~/common/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { CustomNode, CustomNodeType } from '~/common/decorators/interface.decorator';
import { PaymasterFees } from '../paymasters/paymasters.model';
import { Result } from '../system-txs/results.model';
import { PolicyKeyField, UAddressField, Uint256Field } from '~/common/scalars';
import { Price } from '../prices/prices.model';

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

  @Field(() => Boolean)
  executable: boolean;

  @Field(() => [SystemTx])
  systxs: SystemTx[];

  @Field(() => SystemTx, { nullable: true })
  systx?: SystemTx;

  @Field(() => [Result])
  results: Result[];

  @Field(() => Result, { nullable: true })
  result?: Result;

  @Field(() => TransactionStatus)
  status: TransactionStatus;
}

@CustomNodeType()
export class TransactionPreparation extends PickType(Transaction, [
  'hash',
  'timestamp',
  'gasLimit',
  'feeToken',
  'maxAmount',
  'paymaster',
  'paymasterEthFees',
]) {
  @UAddressField()
  account: UAddress;

  @PolicyKeyField()
  policy: PolicyKey;

  @DecimalField()
  maxNetworkFee: Decimal;

  @DecimalField()
  totalEthFees: Decimal;
}

export enum TransactionStatus {
  Pending = 'Pending',
  Scheduled = 'Scheduled',
  Successful = 'Successful',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}
registerEnumType(TransactionStatus, { name: 'TransactionStatus' });

@ObjectType()
export class EstimatedFeeParts {
  @DecimalField()
  networkFee: Decimal;

  @Field(() => PaymasterFees)
  paymasterFees: PaymasterFees;

  @DecimalField()
  maxFeePerGas: Decimal;

  @DecimalField()
  maxPriorityFeePerGas: Decimal;

  @DecimalField()
  total: Decimal;
}

@CustomNodeType()
export class EstimatedTransactionFees extends CustomNode {
  @Field(() => EstimatedFeeParts)
  eth: EstimatedFeeParts;

  @Field(() => EstimatedFeeParts)
  feeToken: EstimatedFeeParts;

  @Uint256Field()
  gasLimit: bigint;

  @Uint256Field()
  gasPerPubdataLimit: bigint;
}
