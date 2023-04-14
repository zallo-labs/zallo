import { Comment } from '@gen/comment/comment.model';
import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaService } from '../util/prisma/prisma.service';
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
    @Info() info: GraphQLResolveInfo,
  ): Promise<Comment> {
    return this.prisma.asUser.comment.create({
      data: {
        account: connectAccount(account),
        key,
        author: connectOrCreateUser(),
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
