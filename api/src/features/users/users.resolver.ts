import { Args, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../util/prisma/prisma.service';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { UpdateUserArgs, UserArgs } from './users.args';
import { User } from '@gen/user/user.model';
import { ProviderService } from '../util/provider/provider.service';
import { getUser } from '~/request/ctx';

@Resolver(() => User)
export class UsersResolver {
  constructor(private prisma: PrismaService, private provider: ProviderService) {}

  @Query(() => User)
  async user(
    @Args() { id = getUser() }: UserArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<User> {
    return (
      (await this.prisma.asUser.user.findUnique({
        where: { id },
        // Prevent pushToken from being included by default, as prevented by RLS
        select: { id: true, name: true, pushToken: false },
        ...(getSelect(info) as any),
      })) ?? { id, name: null, pushToken: null }
    );
  }

  @ResolveField(() => String, { nullable: true })
  async name(@Parent() user: User): Promise<string | null> {
    const contact = this.prisma.asUser.contact.findUnique({
      where: { userId_addr: { userId: getUser(), addr: user.id } },
      select: { name: true },
    });

    const account = this.prisma.asUser.account.findUnique({
      where: { id: user.id },
      select: { name: true },
    });

    const zalloMatch = user.id === this.provider.walletAddress && 'Zallo';

    return (
      (await contact)?.name ||
      (await account)?.name ||
      user.name ||
      zalloMatch ||
      (await this.provider.lookupAddress(user.id))
    );
  }

  @Mutation(() => User)
  async updateUser(
    @Args() { name, pushToken }: UpdateUserArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<User> {
    const user = getUser();

    return this.prisma.asUser.user.upsert({
      where: { id: user },
      create: {
        id: user,
        name,
        pushToken,
      },
      update: {
        name,
        pushToken,
      },
      select: { id: true, name: true, pushToken: false },
      ...(getSelect(info) as any),
    });
  }
}
