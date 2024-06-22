import { Field, InterfaceType, ObjectType, createUnionType } from '@nestjs/graphql';
import { Address, Hex, PolicyKey } from 'lib';
import { AddressField, AddressScalar } from '~/common/scalars/Address.scalar';
import { BytesField } from '~/common/scalars/Bytes.scalar';
import { Uint256Field } from '~/common/scalars/BigInt.scalar';
import { GraphQLJSON } from 'graphql-scalars';
import { PolicyKeyField } from '~/common/scalars/PolicyKey.scalar';
import Decimal from 'decimal.js';
import { DecimalField } from '~/common/scalars/Decimal.scalar';

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

@InterfaceType()
export class TransferlikeOp extends GenericOp {
  @AddressField()
  token: Address;

  @DecimalField()
  amount: Decimal;
}

@ObjectType({ implements: TransferlikeOp })
export class TransferOp extends TransferlikeOp {
  @AddressField()
  to: Address;
}

@ObjectType({ implements: TransferlikeOp })
export class TransferFromOp extends TransferlikeOp {
  @AddressField()
  from: Address;

  @AddressField()
  to: Address;
}

@ObjectType({ implements: TransferlikeOp })
export class TransferApprovalOp extends TransferlikeOp {
  @AddressField()
  spender: Address;
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
