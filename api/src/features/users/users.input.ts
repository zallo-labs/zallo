import { Field, InputType } from '@nestjs/graphql';

import { UAddress } from 'lib';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';

@InputType()
export class UpdateUserInput {
  @UAddressField({ nullable: true })
  primaryAccount?: UAddress;
}

@InputType()
export class LinkInput {
  @Field(() => String)
  token: string;
}
