import { Field, InterfaceType } from '@nestjs/graphql';
import { Account } from '../accounts/accounts.model';
import { Policy } from '../policies/policies.model';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Approver } from '../approvers/approvers.model';
import { Node, NodeType } from '~/decorators/interface.decorator';
import { makeUnionTypeResolver } from '../database/database.util';
import { Risk } from './proposals.input';

@InterfaceType({ implements: () => Node, resolveType: makeUnionTypeResolver() })
export class Proposal extends Node {
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
  createdAt: Date;

  @Field(() => Approver)
  proposedBy: Approver;

  @Field(() => [ProposalResponse])
  responses: ProposalResponse[];

  @Field(() => [Approval])
  approvals: Approval[];

  @Field(() => [Rejection])
  rejections: Rejection[];

  @Field(() => Risk, { nullable: true })
  riskLabel?: Risk;
}

@NodeType({ isAbstract: true })
export class ProposalResponse extends Node {
  @Field(() => Proposal)
  proposal: Proposal;

  @Field(() => Approver)
  approver: Approver;

  @Field(() => Date)
  createdAt: Date;
}

@NodeType()
export class Approval extends ProposalResponse {
  // Don't include signature as user's may want to retract it later -
}

@NodeType()
export class Rejection extends ProposalResponse {}
