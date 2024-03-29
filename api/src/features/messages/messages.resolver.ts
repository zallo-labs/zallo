import { ID, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { Message } from './messages.model';
import { Input } from '~/decorators/input.decorator';
import { ProposeMessageInput } from './messages.input';
import { GraphQLResolveInfo } from 'graphql';
import { ApproveInput, UniqueProposalInput } from '../proposals/proposals.input';
import { MessagesService } from './messages.service';
import { getShape } from '../database/database.select';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';

@Resolver(() => Message)
export class MessagesResolver {
  constructor(private service: MessagesService) {}

  @Query(() => Message, { nullable: true })
  async message(@Input() input: UniqueProposalInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(input.id, getShape(info));
  }

  @ComputedField<typeof e.Message>(() => Boolean, { signature: true })
  async updatable(@Parent() { signature }: Message) {
    return !signature;
  }

  @Mutation(() => Message)
  async proposeMessage(@Input() input: ProposeMessageInput, @Info() info: GraphQLResolveInfo) {
    const { id } = await this.service.propose(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => Message)
  async approveMessage(@Input() input: ApproveInput, @Info() info: GraphQLResolveInfo) {
    await this.service.approve(input);
    return this.service.selectUnique(input.id, getShape(info));
  }

  @Mutation(() => ID)
  async removeMessage(@Input() input: UniqueProposalInput) {
    return this.service.remove(input.id);
  }
}
