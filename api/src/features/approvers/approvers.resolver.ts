import { Approver } from '@gen/approver/approver.model';
import { ID, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Id, toId } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { ProviderService } from '~/provider/provider.service';

@Resolver(() => Approver)
export class ApproversResolver {
  constructor(private prisma: PrismaService, private provider: ProviderService) {}

  @ResolveField(() => ID)
  id(@Parent() a: Approver): Id {
    return toId(`${a.quorumStateId}-${a.userId}`);
  }

  @ResolveField(() => String)
  async name(@Parent() a: Approver): Promise<string | null> {
    const user =
      a.user ||
      (await this.prisma.user.findUnique({
        where: { id: a.userId },
        select: { name: true },
      }));

    if (user?.name) return user.name;

    // Use ENS name as user name if there is one
    const ens = await this.provider.lookupAddress(a.userId);
    if (ens) {
      this.prisma.user.update({
        where: { id: a.userId },
        data: { name: ens },
      });
    }

    return ens;
  }
}
