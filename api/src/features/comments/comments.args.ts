import { ArgsType } from '@nestjs/graphql';
import { Address, Id } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';

@ArgsType()
export class FindCommentsArgs {
  @AddressField()
  account: Address;

  @IdField()
  key: Id;
}

@ArgsType()
export class CreateCommentArgs extends FindCommentsArgs {
  content: string;
}

@ArgsType()
export class UniqueCommentArgs {
  id: number;
}
