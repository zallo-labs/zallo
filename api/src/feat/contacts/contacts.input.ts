import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { Chain } from 'chains';
import { UAddress } from 'lib';
import { ChainField } from '~/common/scalars/Chain.scalar';
import { UAddressField } from '~/common/scalars/UAddress.scalar';

@ArgsType()
export class UniqueAddressArgs {
  @UAddressField()
  address: UAddress;
}

@InputType()
export class ContactsInput {
  @Field(() => String, { nullable: true })
  query?: string;

  @ChainField({ nullable: true })
  chain?: Chain;
}

@InputType()
export class UpsertContactInput {
  @UAddressField({ nullable: true })
  previousAddress?: UAddress;

  @UAddressField()
  address: UAddress;

  @Field(() => String)
  name: string;
}
