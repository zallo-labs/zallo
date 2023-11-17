import { Field, ObjectType } from '@nestjs/graphql';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eql from '~/edgeql-interfaces';
import { UAddress } from 'lib';

@ObjectType()
export class Contact implements Partial<eql.Contact> {
  @IdField()
  id: uuid;

  @UAddressField()
  address: UAddress;

  @Field(() => String)
  label: string;
}
