import { ArgsType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@ArgsType()
export class FindCommentsArgs {
  @AddressField()
  account: Address;

  key: string;
}

@ArgsType()
export class CreateCommentArgs extends FindCommentsArgs {
  content: string;
}

@ArgsType()
export class UniqueCommentArgs {
  id: number;
}
