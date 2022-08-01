import { Approver } from '@gen/approver/approver.model';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { getApproverId, toAccountRef } from 'lib';

@Resolver(() => Approver)
export class ApproversResolver {
  @ResolveField(() => String)
  id(@Parent() a: Approver): string {
    return getApproverId(a.safeId, toAccountRef(a.accountRef), a.userId);
  }
}
