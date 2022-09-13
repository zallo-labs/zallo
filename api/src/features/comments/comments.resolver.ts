import { Comment } from '@gen/comment/comment.model';
import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Address } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { DeviceAddr } from '~/decorators/device.decorator';
import { connectOrCreateDevice } from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import {
  CreateCommentArgs,
  UniqueCommentArgs,
  FindCommentsArgs,
} from './comments.args';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Comment])
  async comments(
    @Args() { account, key }: FindCommentsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Comment[]> {
    return this.prisma.comment.findMany({
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
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Comment> {
    return this.prisma.comment.create({
      data: {
        accountId: account,
        key,
        author: connectOrCreateDevice(device),
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
    return this.prisma.comment.delete({
      where: { id },
      ...getSelect(info),
    });
  }
}
