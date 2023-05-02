import { Field, ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Contact } from '../contacts/contacts.model';
import { Approver } from '../approvers/approvers.model';
import { Approval, Proposal } from '../proposals/proposals.model';

@ObjectType()
export class User {
  @AddressField()
  id: string; // Address

  name: string | null;

  // Hidden
  // pushToken: string | null;

  contacts?: Contact[];

  approvals?: Approval[];

  approvers?: Approver[];

  proposals?: Proposal[];
}
