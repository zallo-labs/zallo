import { Field } from '@nestjs/graphql';

import { Node, NodeType } from '~/decorators/interface.decorator';
import { Account } from '~/features/accounts/accounts.model';
import { UserApprover } from '../approvers/approvers.model';
import { Contact } from '../contacts/contacts.model';

@NodeType()
export class User extends Node {
  @Field(() => Account, { nullable: true })
  primaryAccount?: Account;

  @Field(() => [UserApprover])
  approvers: UserApprover[];

  @Field(() => [Contact])
  contacts: Contact[];
}
