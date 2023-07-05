import { Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Approver } from './approvers.model';
import { ApproversService } from './approvers.service';
import { Input } from '~/decorators/input.decorator';
import { ApproverInput, UpdateApproverInput } from './approvers.input';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../database/database.select';

@Resolver(() => Approver)
export class ApproversResolver {
  constructor(private service: ApproversService) {}

  @Query(() => Approver)
  async approver(@Input() { address }: ApproverInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(address, getShape(info));
  }

  @Mutation(() => Approver)
  async updateApprover(@Input() input: UpdateApproverInput, @Info() info: GraphQLResolveInfo) {
    await this.service.upsert(input);

    return (await this.service.selectUnique(input.address, getShape(info)))!;
  }
}
