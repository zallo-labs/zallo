import { Comment } from '@gen/comment/comment.model';
import { Reaction } from '@gen/reaction/reaction.model';
import {
  Args,
  Info,
  Mutation,
  Parent,
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
import { ReactToCommentArgs } from './reactions.args';

@Resolver(() => Reaction)
export class ReactionsResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField(() => String)
  async id(@Parent() r: Reaction): Promise<Id> {
    return toId(`${r.safeId}-${r.key}-${r.nonce}-${r.userId}`);
  }

  @Mutation(() => Reaction, { nullable: true })
  async reactToComment(
    @Args() { safe, key, nonce, emojis }: ReactToCommentArgs,
    @Info() info: GraphQLResolveInfo,
    @UserAddr() user: Address,
  ): Promise<Reaction | null> {
    const commentId = { safeId: safe, key, nonce };

    // if (emojis.length) {
    return this.prisma.reaction.upsert({
      where: {
        safeId_key_nonce_approverId: {
          ...commentId,
          approverId: user,
        },
      },
      create: {
        safe: connectOrCreateSafe(safe),
        comment: { connect: { safeId_key_nonce: commentId } },
        user: connectOrCreateUser(user),
        emojis,
      },
      update: {
        // Ensure emojis are unique
        emojis: { set: [...new Set(emojis)] },
      },
      ...getSelect(info),
    });
    // } else {
    //   return this.prisma.reaction.delete({
    //     where: {
    //       safeId_key_nonce_approverId: {
    //         safeId: safe,
    //         key,
    //         nonce,
    //         approverId: user,
    //       },
    //     },
    //     ...getSelect(info),
    //   });
    // }
  }
}
