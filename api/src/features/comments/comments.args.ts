import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Address, Id } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';

@ArgsType()
export class ManyCommentsArgs {
  @AddressField()
  safe: Address;

  @IdField()
  key: Id;
}

@ArgsType()
export class CreateCommentArgs extends ManyCommentsArgs {
  content: string;
}

@ArgsType()
export class UniqueCommentArgs extends ManyCommentsArgs {
  @Field(() => Int)
  nonce: number;
}
