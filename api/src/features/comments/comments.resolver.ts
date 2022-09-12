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
import { DeviceAddr } from '~/decorators/device.decorator';
import {
  connectOrCreateDevice,
  connectOrCreateAccount,
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
    @Args() { account, key }: ManyCommentsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Comment[]> {
    const r = await this.prisma.comment.findMany({
      where: {
        accountId: account,
        key,
      },
      ...getSelect(info),
    });

    return r ?? [];
  }

  @ResolveField(() => String)
  async id(@Parent() c: Comment): Promise<Id> {
    return toId(`${c.accountId}-${c.key}-${c.nonce}`);
  }

  @Mutation(() => Comment)
  async createComment(
    @Args() { account, key, content }: CreateCommentArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Comment> {
    return this.prisma.comment.create({
      data: {
        account: connectOrCreateAccount(account),
        key,
        author: connectOrCreateDevice(device),
        content,
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Comment, { nullable: true })
  async deleteComment(
    @Args() { account, key, nonce }: UniqueCommentArgs,
  ): Promise<Comment | null> {
    return this.prisma.comment.delete({
      where: {
        accountId_key_nonce: {
          accountId: account,
          key,
          nonce,
        },
      },
    });
  }
}
