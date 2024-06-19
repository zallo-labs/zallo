import { Field } from '@nestjs/graphql';
import { Contact } from '../contacts/contacts.model';
import { UserApprover } from '../approvers/approvers.model';
import { Account } from '~/features/accounts/accounts.model';
import { CustomNode, CustomNodeType, Node, NodeType } from '~/decorators/interface.decorator';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Address } from 'lib';

@NodeType()
export class User extends Node {
  @Field(() => Account, { nullable: true })
  primaryAccount?: Account;

  @Field(() => [UserApprover])
  approvers: UserApprover[];

  @Field(() => [Contact])
  contacts: Contact[];
}

@CustomNodeType()
export class UserLinked extends CustomNode {
  @Field(() => User)
  user: User;

  @AddressField()
  issuer: Address;

  @AddressField()
  linker : Address;
}
