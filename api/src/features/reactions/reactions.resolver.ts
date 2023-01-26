import { Reaction } from '@gen/reaction/reaction.model';
import { Args, Info, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Address, Id, toId } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { UserId } from '~/decorators/user.decorator';
import { connectOrCreateUser } from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import { ReactToCommentArgs } from './reactions.args';

@Resolver(() => Reaction)
export class ReactionsResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField(() => String)
  id(@Parent() r: Reaction): Id {
    return toId(`${r.commentId}-${r.userId}`);
  }

  @Mutation(() => Reaction, { nullable: true })
  async reactToComment(
    @Args() { id, emojis }: ReactToCommentArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Reaction | null> {
    return this.prisma.reaction.upsert({
      where: {
        commentId_userId: {
          commentId: id,
          userId: user,
        },
      },
      create: {
        comment: { connect: { id } },
        user: connectOrCreateUser(user),
        emojis,
      },
      update: {
        // Ensure emojis are unique
        emojis: { set: [...new Set(emojis)] },
      },
      ...getSelect(info),
    });
  }
}
