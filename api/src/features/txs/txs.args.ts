import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { BigNumber, BytesLike } from 'ethers';
import { Address, Id, TxSalt } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { Bytes8Field } from '~/apollo/scalars/Bytes8.scalar';
import { Uint256BnField } from '~/apollo/scalars/Uint256Bn.scalar';

@ArgsType()
export class TxsArgs {
  @AddressField()
  safe: Address;
}

@InputType()
export class TxInput {
  @AddressField()
  to: Address;

  @Uint256BnField()
  value: BigNumber;

  @BytesField()
  data: BytesLike;

  @Bytes8Field()
  salt: TxSalt;
}

@ArgsType()
export class ProposeTxArgs {
  @AddressField()
  safe: Address;

  tx: TxInput;

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

@ObjectType()
export class RevokeApprovalResp {
  @Field(() => String, { nullable: true })
  id?: Id;
}

@ArgsType()
export class ApproveArgs extends RevokeApprovalArgs {
  @BytesField()
  signature: BytesLike;
}
