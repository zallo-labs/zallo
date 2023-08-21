import { ID, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MessageProposal } from './message-proposals.model';
import { Input } from '~/decorators/input.decorator';
import { ProposeMessageInput } from './message-proposals.input';
import { GraphQLResolveInfo } from 'graphql';
import { ApproveInput, ProposalInput } from '../proposals/proposals.input';
import { MessageProposalsService } from './message-proposals.service';
import { getShape } from '../database/database.select';
import { ComputedField } from '~/decorators/computed.decorator';

@Resolver(() => MessageProposal)
export class MessageProposalsResolver {
  constructor(private service: MessageProposalsService) {}

  @Query(() => MessageProposal, { nullable: true })
  async messageProposal(@Input() input: ProposalInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(input.hash, getShape(info));
  }

  @ComputedField(() => Boolean, {})
  async updatable() {
    return true;
  }

  @Mutation(() => MessageProposal)
  async proposeMessage(@Input() input: ProposeMessageInput, @Info() info: GraphQLResolveInfo) {
    const { id } = await this.service.propose(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => MessageProposal)
  async approveMessage(@Input() input: ApproveInput, @Info() info: GraphQLResolveInfo) {
    await this.service.approve(input);
    return this.service.selectUnique(input.hash, getShape(info));
  }

  @Mutation(() => ID)
  async removeMessage(@Input() input: ProposalInput, @Info() info: GraphQLResolveInfo) {
    return this.service.remove(input.hash);
  }
}
