import { Field, ObjectType } from '@nestjs/graphql';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { Contact } from '../contacts/contacts.model';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Approver } from '../approvers/approvers.model';

@ObjectType()
export class User {
  @IdField()
  id: uuid;

  @Field(() => String)
  name: string;

  @Field(() => [Approver])
  approvers: Approver[];

  @Field(() => [Contact])
  contacts: Contact[];
}
