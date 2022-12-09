import { Approver } from '@gen/approver/approver.model';
import { ID, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Id, toId } from 'lib';

@Resolver(() => Approver)
export class ApproversResolver {
  @ResolveField(() => ID)
  id(@Parent() a: Approver): Id {
    return toId(`${a.quorumStateId}-${a.userId}`);
  }
}
