import { Approver } from '@gen/approver/approver.model';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { getApproverId, toWalletRef } from 'lib';

@Resolver(() => Approver)
export class ApproversResolver {
  @ResolveField(() => String)
  id(@Parent() a: Approver): string {
    return getApproverId(a.accountId, toWalletRef(a.walletRef), a.deviceId);
  }
}
