import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Account } from '../accounts/accounts.model';
import { Policy, ValidationError } from '../policies/policies.model';
import { Bytes32Field } from '~/common/scalars/Bytes.scalar';
import { Approver } from '../approvers/approvers.model';
import { Node, NodeInterface, NodeType } from '~/common/decorators/interface.decorator';
import { ProposalEvent } from './proposals.input';
import { UAddress, UUID } from 'lib';
import { UAddressField } from '~/common/scalars/UAddress.scalar';
import { IdField } from '~/common/scalars/Id.scalar';
import { UrlField, UrlScalar } from '~/common/scalars/Url.scalar';

@ObjectType()
export class DappMetadata {
  @Field(() => String)
  name: string;

  @UrlField()
  url: string;

  @Field(() => [UrlScalar])
  icons: string[];
}

@NodeInterface()
export class Proposal {
  @Bytes32Field()
  hash: string; // Hex

  @Field(() => Account)
  account: Account;

  @Field(() => Policy)
  policy: Policy;

  @Field(() => [ValidationError])
  validationErrors: ValidationError[];

  @Field(() => String, { nullable: true })
  label?: string;

  @UrlField({ nullable: true })
  icon?: string;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Approver)
  proposedBy: Approver;

  @Field(() => DappMetadata, { nullable: true })
  dapp?: DappMetadata;

  @Field(() => [Approval])
  approvals: Approval[];

  @Field(() => [Rejection])
  rejections: Rejection[];
}

@NodeInterface()
export class ProposalResponse extends Node {
  @Field(() => Proposal)
  proposal: Proposal;

  @Field(() => Approver)
  approver: Approver;

  @Field(() => Date)
  createdAt: Date;
}

enum ApprovalIssue {
  HashMismatch = 'HashMismatch',
  Expired = 'Expired',
}
registerEnumType(ApprovalIssue, { name: 'ApprovalIssue' });

@NodeType({ implements: ProposalResponse })
export class Approval extends ProposalResponse {
  // Don't include signature as user's may want to retract it later

  @Field(() => [ApprovalIssue])
  issues: ApprovalIssue[];

  @Field(() => Boolean)
  invalid: boolean;
}

@NodeType({ implements: ProposalResponse })
export class Rejection extends ProposalResponse {}

@ObjectType()
export class ProposalUpdated {
  @IdField()
  id: UUID;

  @Field(() => ProposalEvent)
  event: ProposalEvent;

  @UAddressField()
  account: UAddress;

  @Field(() => Proposal, { nullable: true })
  proposal?: Proposal;
}
