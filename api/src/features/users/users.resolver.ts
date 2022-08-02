import {
  Args,
  Info,
  Mutation,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';

import { Safe } from '@gen/safe/safe.model';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { GetAddrNameArgs } from './users.input';
import { UserAddr } from '~/decorators/user.decorator';
import { User } from '@gen/user/user.model';
import { UpsertOneUserArgs } from '@gen/user/upsert-one-user.args';
import { Address } from 'lib';
import { SubgraphService } from '../subgraph/subgraph.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
  ) {}

  @Query(() => User, { nullable: true })
  async user(
    @UserAddr() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: user },
      ...getSelect(info),
    });
  }

  @ResolveField(() => [Safe])
  async safes(
    @UserAddr() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe[]> {
    return this.prisma.safe.findMany({
      where: {
        OR: [
          // Deployed safe - approvers aren't stored
          // { id: { in: await this.subgraph.userSafes(user) } },
          // Counterfactual safes
          {
            accounts: {
              some: {
                approvers: {
                  some: {
                    userId: { equals: user },
                  },
                },
              },
            },
          },
        ],
      },
      distinct: 'id',
      ...getSelect(info),
    });
  }

  @Query(() => String, { nullable: true })
  async addrName(
    @Args() { addr }: GetAddrNameArgs,
    @UserAddr() user: string,
  ): Promise<string | null> {
    const contact = await this.prisma.contact.findUnique({
      where: {
        userId_addr: {
          userId: user,
          addr,
        },
      },
      select: { name: true },
    });

    if (contact) return contact.name;

    const safe = await this.prisma.safe.findUnique({
      where: { id: addr },
      select: { name: true },
    });

    return safe?.name || null;
  }

  @Mutation(() => User)
  async upsertUser(
    @Args() args: UpsertOneUserArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    return this.prisma.user.upsert({
      ...args,
      ...getSelect(info),
    });
  }
}
