import { Field, ObjectType, createUnionType } from '@nestjs/graphql';
import { Address, Hex, PolicyKey } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Uint256Field } from '~/apollo/scalars/BigInt.scalar';
import { GraphQLJSON } from 'graphql-scalars';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import Decimal from 'decimal.js';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';

@ObjectType()
export class Operation {
  @AddressField()
  to: Address;

  @Uint256Field({ nullable: true })
  value?: bigint;

  @BytesField({ nullable: true })
  data?: Hex;
}

export type OperationFunction = typeof OperationFunction;
export const OperationFunction = createUnionType({
  name: 'OperationFunction',
  types: () =>
    [
      UpdatePolicyOp,
      RemovePolicyOp,
      TransferOp,
      TransferFromOp,
      TransferApprovalOp,
      SwapOp,
      GenericOp,
    ] as const,
});

@ObjectType()
export class GenericOp {
  @Field(() => String)
  _name: string;

  @Field(() => [GraphQLJSON])
  _args: readonly unknown[];
}

@ObjectType()
export class UpdatePolicyOp extends GenericOp {
  @AddressField()
  account: Address;

  @PolicyKeyField()
  key: PolicyKey;

  @Field(() => Number)
  threshold: number;

  @Field(() => [AddressScalar])
  approvers: readonly Address[];
}

@ObjectType()
export class RemovePolicyOp extends GenericOp {
  @AddressField()
  account: Address;

  @PolicyKeyField()
  key: PolicyKey;
}

@ObjectType()
export class TransferOp extends GenericOp {
  @AddressField()
  token: Address;

  @AddressField()
  to: Address;

  @DecimalField()
  amount: Decimal;
}

@ObjectType()
export class TransferFromOp extends GenericOp {
  @AddressField()
  token: Address;

  @AddressField()
  from: Address;

  @AddressField()
  to: Address;

  @DecimalField()
  amount: Decimal;
}

@ObjectType()
export class TransferApprovalOp extends GenericOp {
  @AddressField()
  token: Address;

  @AddressField()
  spender: Address;

  @DecimalField()
  amount: Decimal;
}

@ObjectType()
export class SwapOp extends GenericOp {
  @AddressField()
  fromToken: Address;

  @DecimalField()
  fromAmount: Decimal;

  @AddressField()
  toToken: Address;

  @DecimalField()
  minimumToAmount: Decimal;

  @Field(() => Date)
  deadline: Date;
}

// Account: addPolicy, removePolicy
// SyncswapRouter: swap
