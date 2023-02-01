import { Args, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../util/prisma/prisma.service';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { UpdateUserArgs, UserArgs } from './users.args';
import { UserId } from '~/decorators/user.decorator';
import { User } from '@gen/user/user.model';
import { Address } from 'lib';
import { ProviderService } from '../util/provider/provider.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private prisma: PrismaService, private provider: ProviderService) {}

  @Query(() => User, { nullable: true })
  async user(
    @UserId() user: Address,
    @Args() { id = user }: UserArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User | null> {
    return (
      (await this.prisma.user.findUnique({
        where: { id },
        ...getSelect(info),
      })) ?? { id, name: null, pushToken: null }
    );
  }

  @ResolveField(() => String, { nullable: true })
  async name(@Parent() user: User, @UserId() userUser: Address): Promise<string | null> {
    const contact = this.prisma.contact.findUnique({
      where: { userId_addr: { userId: userUser, addr: user.id } },
      select: { name: true },
    });

    const account = this.prisma.account.findUnique({
      where: { id: user.id },
      select: { name: true },
    });

    return (
      (await contact)?.name ||
      (await account)?.name ||
      user.name ||
      (await this.provider.lookupAddress(user.id))
    );
  }

  @Mutation(() => User)
  async updateUser(
    @Args() { name, pushToken }: UpdateUserArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    return this.prisma.user.upsert({
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
      ...getSelect(info),
    });
  }
}
