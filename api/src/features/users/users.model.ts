import { Field, ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { Contact } from '../contacts/contacts.model';
import { uuid } from 'edgedb/dist/codecs/ifaces';

@ObjectType()
export class User {
  @IdField()
  id: uuid;

  @AddressField()
  address: string; // Address

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => [Contact])
  contacts: Contact[];
}
