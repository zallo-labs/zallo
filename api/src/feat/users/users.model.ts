import { Field } from '@nestjs/graphql';
import { Contact } from '../contacts/contacts.model';
import { Approver } from '../approvers/approvers.model';
import { Account } from '~/feat/accounts/accounts.model';
import {
  CustomNode,
  CustomNodeType,
  Node,
  NodeType,
} from '~/common/decorators/interface.decorator';
import { AddressField } from '~/common/scalars/Address.scalar';
import { Address } from 'lib';

@NodeType()
export class User extends Node {
  @Field(() => Account, { nullable: true })
  primaryAccount?: Account;

  @Field(() => [Approver])
  approvers: Approver[];

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
  linker: Address;
}
