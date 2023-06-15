import { Field, ObjectType, createUnionType } from '@nestjs/graphql';
import { Address, Hex, PolicyKey } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Uint256Field } from '~/apollo/scalars/BigInt.scalar';
import { GraphQLJSON } from 'graphql-scalars';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { Target } from '../policies/policies.model';

@ObjectType()
export class Operation {
  @AddressField()
  to: Address;

  @Uint256Field({ nullable: true })
  value?: bigint;

  @BytesField({ nullable: true })
  data?: Hex;
}

export const OperationFunction = createUnionType({
  name: 'OperationFunction',
  types: () =>
    [
      AddPolicyOp,
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
export class AddPolicyOp extends GenericOp {
  @AddressField()
  account: Address;

  @PolicyKeyField()
  key: PolicyKey;

  @Field(() => Number)
  threshold: number;

  @Field(() => [AddressScalar])
  approvers: readonly Address[];

  @Field(() => [Target])
  targets: Target[];
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

  @Uint256Field()
  amount: bigint;
}

@ObjectType()
export class TransferFromOp extends GenericOp {
  @AddressField()
  token: Address;

  @AddressField()
  from: Address;

  @AddressField()
  to: Address;

  @Uint256Field()
  amount: bigint;
}

@ObjectType()
export class TransferApprovalOp extends GenericOp {
  @AddressField()
  token: Address;

  @AddressField()
  spender: Address;

  @Uint256Field()
  amount: bigint;
}

@ObjectType()
export class SwapOp extends GenericOp {
  @AddressField()
  fromToken: Address;

  @Uint256Field()
  fromAmount: bigint;

  @AddressField()
  toToken: Address;

  @Uint256Field()
  minimumToAmount: bigint;

  @Field(() => Date)
  deadline: Date;
}

// Account: addPolicy, removePolicy
// SyncswapRouter: swap
