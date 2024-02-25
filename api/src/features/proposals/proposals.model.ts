import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Account } from '../accounts/accounts.model';
import { Policy } from '../policies/policies.model';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Approver } from '../approvers/approvers.model';
import { Node, NodeInterface, NodeType } from '~/decorators/interface.decorator';
import { GraphQLURL } from 'graphql-scalars';

@ObjectType()
export class DappMetadata {
  @Field(() => String)
  name: string;

  @Field(() => GraphQLURL)
  url: URL;

  @Field(() => [GraphQLURL])
  icons: URL[];
}

@NodeInterface()
export class Proposal {
  @Bytes32Field()
  hash: string; // Hex

  @Field(() => Account)
  account: Account;

  @Field(() => Policy, { nullable: true })
  policy?: Policy | null;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => String, { nullable: true })
  iconUri?: string;

  @Field(() => Date)
  validFrom: Date;

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

  @Field(() => [Approver])
  potentialApprovers: Approver[];

  @Field(() => [Approver])
  potentialRejectors: Approver[];
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
