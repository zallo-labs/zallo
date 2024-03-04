import { Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  CreatePolicyInput,
  PoliciesInput,
  SatisfiabilityInput,
  UniquePolicyInput,
  UpdatePolicyInput,
} from './policies.input';
import {
  PoliciesService,
  ProposalPolicySatisfiabilityShape,
  ProposalSatisfiabilityShape,
} from './policies.service';
import {
  CreatePolicyResponse,
  Policy,
  SatisfiabilityResult,
  UpdatePolicyResponse,
} from './policies.model';
import { getShape } from '../database/database.select';
import { Input } from '~/decorators/input.decorator';
import e from '~/edgeql-js';
import { ComputedField } from '~/decorators/computed.decorator';
import { DatabaseService } from '../database/database.service';
import { selectProposal } from '../proposals/proposals.service';

@Resolver(() => Policy)
export class PoliciesResolver {
  constructor(
    private service: PoliciesService,
    private db: DatabaseService,
  ) {}

  @Query(() => Policy, { nullable: true })
  async policy(@Input() policy: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(policy, getShape(info));
  }

  @Query(() => [Policy])
  async policies(
    @Input({ defaultValue: {} }) input: PoliciesInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
  }

  @ComputedField<typeof e.Policy>(() => SatisfiabilityResult, ProposalPolicySatisfiabilityShape)
  async satisfiability(
    @Input() { proposal }: SatisfiabilityInput,
    @Parent() policy: ProposalPolicySatisfiabilityShape,
  ): Promise<SatisfiabilityResult> {
    const p = await this.db.query(
      e.select(selectProposal(proposal), () => ProposalSatisfiabilityShape),
    );

    return this.service.satisfiability(p, policy);
  }

  @Mutation(() => CreatePolicyResponse)
  async createPolicy(
    @Input() input: CreatePolicyInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof CreatePolicyResponse> {
    const r = await this.service.create(input);
    return r.isOk() ? (await this.service.selectUnique(r.value, getShape(info)))! : r.error;
  }

  @Mutation(() => UpdatePolicyResponse)
  async updatePolicy(
    @Input() input: UpdatePolicyInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof UpdatePolicyResponse> {
    const r = await this.service.update(input);
    return r.isOk()
      ? (await this.service.selectUnique(
          { account: input.account, key: input.key },
          getShape(info),
        ))!
      : r.error;
  }

  @Mutation(() => Policy)
  async removePolicy(@Input() input: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    await this.service.remove(input);
    return this.service.selectUnique({ account: input.account, key: input.key }, getShape(info));
  }
}
