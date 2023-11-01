import { Field, InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@InputType()
export class UpdateUserInput {
  @AddressField({ nullable: true })
  primaryAccount?: Address;
}

@InputType()
export class LinkInput {
  @Field(() => String)
  token: string;
}
