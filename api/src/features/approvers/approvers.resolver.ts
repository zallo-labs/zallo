import { Approver } from '@gen/approver/approver.model';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver(() => Approver)
export class ApproversResolver {
  @ResolveField(() => String)
  id(@Parent() a: Approver): string {
    return `${a.stateId}-${a.userId}`;
  }
}
