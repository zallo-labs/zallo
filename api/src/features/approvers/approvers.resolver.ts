import { Approver } from '@gen/approver/approver.model';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { getApproverId } from 'lib';

@Resolver(() => Approver)
export class ApproversResolver {
  @ResolveField(() => String)
  id(@Parent() a: Approver): string {
    return getApproverId(a.safeId, a.groupRef, a.userId);
  }
}
