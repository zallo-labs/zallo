import { ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { Contact } from '../contacts/contacts.model';

@ObjectType()
export class User {
  @IdField()
  id: string;

  @AddressField()
  address: string; // Address

  name: string | null;

  contacts?: Contact[];
}
