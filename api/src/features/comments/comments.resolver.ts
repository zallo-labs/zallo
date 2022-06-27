import { Comment } from '@gen/comment/comment.model';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Address, Id, toId } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { UserAddr } from '~/decorators/user.decorator';
import {
  connectOrCreateUser,
  connectOrCreateSafe,
} from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import {
  CreateCommentArgs,
  UniqueCommentArgs,
  ManyCommentsArgs,
} from './comments.args';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Comment])
  async comments(
    @Args() { safe, key }: ManyCommentsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Comment[]> {
    const r = await this.prisma.comment.findMany({
      where: {
        safeId: safe,
        key,
      },
      ...getSelect(info),
    });

    return r ?? [];
  }

  @ResolveField(() => String)
  async id(@Parent() c: Comment): Promise<Id> {
    return toId(`${c.safeId}-${c.key}-${c.nonce}`);
  }

  @Mutation(() => Comment)
  async createComment(
    @Args() { safe, key, content }: CreateCommentArgs,
    @UserAddr() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Comment> {
    return this.prisma.comment.create({
      data: {
        safe: connectOrCreateSafe(safe),
        key,
        author: connectOrCreateUser(user),
        content,
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Comment, { nullable: true })
  async deleteComment(
    @Args() { safe, key, nonce }: UniqueCommentArgs,
  ): Promise<Comment | null> {
    return this.prisma.comment.delete({
      where: {
        safeId_key_nonce: {
          safeId: safe,
          key,
          nonce,
        },
      },
    });
  }
}
