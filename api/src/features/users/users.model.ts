import { Field, ObjectType } from '@nestjs/graphql';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { Contact } from '../contacts/contacts.model';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { UserApprover } from '../approvers/approvers.model';
import { Account } from '~/features/accounts/accounts.model';

@ObjectType()
export class User {
  @IdField()
  id: uuid;

  @Field(() => Account, { nullable: true })
  primaryAccount?: Account;

  @Field(() => [UserApprover])
  approvers: UserApprover[];

  @Field(() => [Contact])
  contacts: Contact[];
}
