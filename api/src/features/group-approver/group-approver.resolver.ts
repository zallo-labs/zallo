import { GroupApprover } from '@gen/group-approver/group-approver.model';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver(() => GroupApprover)
export class GroupApproverResolver {
  @ResolveField(() => String)
  id(@Parent() ga: GroupApprover): string {
    return `${ga.safeId}-${ga.groupHash}-${ga.approverId}`;
  }
}
