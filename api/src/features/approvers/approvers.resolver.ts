import { Approver } from '@gen/approver/approver.model';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Id, toId } from 'lib';

@Resolver(() => Approver)
export class ApproversResolver {
  @ResolveField(() => String)
  id(@Parent() a: Approver): Id {
    return toId(`${a.configId}-${a.deviceId}`);
  }
}
