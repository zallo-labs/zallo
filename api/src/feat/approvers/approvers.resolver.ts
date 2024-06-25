import { Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserApprover } from './approvers.model';
import { ApproversService } from './approvers.service';
import { Input } from '~/common/decorators/input.decorator';
import { ApproverInput, UpdateApproverInput } from './approvers.input';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '~/core/database';

@Resolver(() => UserApprover)
export class ApproversResolver {
  constructor(private service: ApproversService) {}

  @Query(() => UserApprover)
  async approver(
    @Input({ defaultValue: {} }) { address }: ApproverInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.selectUnique(address, getShape(info));
  }

  @Mutation(() => UserApprover)
  async updateApprover(@Input() input: UpdateApproverInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return (await this.service.selectUnique(input.address, getShape(info)))!;
  }
}
