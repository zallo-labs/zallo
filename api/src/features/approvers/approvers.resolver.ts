import { Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';

import { Input } from '~/decorators/input.decorator';
import { getShape } from '../database/database.select';
import { ApproverInput, UniqueCloudShareInput, UpdateApproverInput } from './approvers.input';
import { UserApprover } from './approvers.model';
import { ApproversService } from './approvers.service';

@Resolver(() => UserApprover)
export class ApproversResolver {
  constructor(private service: ApproversService) {}

  @Query(() => UserApprover, { nullable: true })
  async approver(
    @Input({ defaultValue: {} }) { address }: ApproverInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.selectUnique(address, getShape(info));
  }

  @Query(() => String, { nullable: true })
  async cloudShare(@Input() input: UniqueCloudShareInput): Promise<string | null> {
    return this.service.selectUniqueShare(input);
  }

  @Mutation(() => UserApprover)
  async updateApprover(@Input() input: UpdateApproverInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return (await this.service.selectUnique(input.address, getShape(info)))!;
  }
}
