import { Field } from '@nestjs/graphql';
import { Contact } from '../contacts/contacts.model';
import { UserApprover } from '../approvers/approvers.model';
import { Account } from '~/features/accounts/accounts.model';
import { Node, NodeType } from '~/decorators/interface.decorator';

@NodeType()
export class User extends Node {
  @Field(() => Account, { nullable: true })
  primaryAccount?: Account;

  @Field(() => [UserApprover])
  approvers: UserApprover[];

  @Field(() => [Contact])
  contacts: Contact[];
}
