import { Reaction } from '@gen/reaction/reaction.model';
import { Args, Info, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Id, toId } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { connectOrCreateUser } from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import { ReactToCommentArgs } from './reactions.args';
import { getUser } from '~/request/ctx';

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
    @Info() info: GraphQLResolveInfo,
  ): Promise<Reaction | null> {
    const user = getUser();

    return this.prisma.asUser.reaction.upsert({
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
