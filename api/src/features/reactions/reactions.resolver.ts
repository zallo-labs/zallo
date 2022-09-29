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
import { DeviceAddr } from '~/decorators/device.decorator';
import { connectOrCreateDevice } from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import { ReactToCommentArgs } from './reactions.args';

@Resolver(() => Reaction)
export class ReactionsResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField(() => String)
  id(@Parent() r: Reaction): Id {
    return toId(`${r.commentId}-${r.deviceId}`);
  }

  @Mutation(() => Reaction, { nullable: true })
  async reactToComment(
    @Args() { id, emojis }: ReactToCommentArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Reaction | null> {
    return this.prisma.reaction.upsert({
      where: {
        commentId_deviceId: {
          commentId: id,
          deviceId: device,
        },
      },
      create: {
        comment: { connect: { id } },
        device: connectOrCreateDevice(device),
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
