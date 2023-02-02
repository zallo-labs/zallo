import { Comment } from '@gen/comment/comment.model';
import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Address } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { UserId } from '~/decorators/user.decorator';
import { connectAccount, connectOrCreateUser } from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import { CreateCommentArgs, UniqueCommentArgs, FindCommentsArgs } from './comments.args';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Comment])
  async comments(
    @Args() { account, key }: FindCommentsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Comment[]> {
    return this.prisma.asUser.comment.findMany({
      where: {
        accountId: account,
        key,
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Comment)
  async createComment(
    @Args() { account, key, content }: CreateCommentArgs,
    @UserId() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Comment> {
    return this.prisma.asUser.comment.create({
      data: {
        account: connectAccount(account),
        key,
        author: connectOrCreateUser(device),
        content,
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Comment)
  async deleteComment(
    @Args() { id }: UniqueCommentArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Comment> {
    return this.prisma.asUser.comment.delete({
      where: { id },
      ...getSelect(info),
    });
  }
}
