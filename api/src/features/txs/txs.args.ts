import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { BigNumber, BytesLike } from 'ethers';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { Uint256BnField } from '~/apollo/scalars/Uint256Bn.scalar';

@ArgsType()
export class TxsArgs {
  @AddressField()
  safe: Address;
}

@InputType()
export class OpInput {
  @AddressField()
  to: Address;

  @Uint256BnField()
  value: BigNumber;

  @BytesField()
  data: BytesLike;

  @Uint256BnField()
  nonce: BigNumber;
}

@ArgsType()
export class ProposeTxArgs {
  @AddressField()
  safe: Address;

  @Field(() => [OpInput])
  ops: OpInput[];

  @BytesField()
  signature: string;
}

@ArgsType()
export class RevokeApprovalArgs {
  @AddressField()
  safe: Address;

  @Bytes32Field()
  txHash: string;
}

@ArgsType()
export class ApproveArgs extends RevokeApprovalArgs {
  @BytesField()
  signature: BytesLike;
}
