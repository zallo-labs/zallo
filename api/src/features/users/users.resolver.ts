import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { Post } from '~gen/post/post.model';
import { FindManyUserArgs } from '~gen/user/find-many-user.args';
import { FindUniqueUserArgs } from '~gen/user/find-unique-user.args';
import { User } from '~gen/user/user.model';

@Resolver(() => User)
export class UsersResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => User, { nullable: true })
  async user(@Args() args: FindUniqueUserArgs): Promise<User | null> {
    return this.prisma.user.findUnique(args);
  }

  @Query(() => [User])
  async users(@Args() args: FindManyUserArgs): Promise<User[]> {
    return this.prisma.user.findMany(args);
  }

  @ResolveField(() => [Post])
  async posts(@Parent() user: User) {
    return this.prisma.post.findMany({
      where: {
        authorId: user.id,
      },
    });
  }
}
