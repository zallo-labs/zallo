import { ObjectType } from '@nestjs/graphql';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eql from '~/edgeql-interfaces';

@ObjectType()
export class Contact implements Partial<eql.Contact> {
  @IdField()
  id: uuid;

  @AddressField()
  address: string; // Address

  name: string;
}
