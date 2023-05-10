import { ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eql from '~/edgeql-interfaces';

@ObjectType()
export class Contact implements Partial<eql.Contact> {
  @IdField()
  id: string;

  @AddressField()
  address: string; // Address

  name: string;
}
