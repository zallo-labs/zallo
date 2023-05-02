import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Approver } from './approvers.model';

@Resolver(() => Approver)
export class ApproversResolver {
  @ResolveField(() => String)
  id(@Parent() a: Approver): string {
    return `${a.stateId}-${a.userId}`;
  }
}
