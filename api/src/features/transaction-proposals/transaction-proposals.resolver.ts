import { ID, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLResolveInfo } from 'graphql';

import { ComputedField } from '~/decorators/computed.decorator';
import { Input } from '~/decorators/input.decorator';
import e from '~/edgeql-js';
import { getShape } from '../database/database.select';
import { ApproveInput, UniqueProposalInput } from '../proposals/proposals.input';
import {
  ExecuteTransactionProposalInput,
  ProposeTransactionInput,
  TransactionProposalsInput,
  UpdateTransactionProposalInput,
} from './transaction-proposals.input';
import {
  EstimatedTransactionFees,
  TransactionProposal,
  TransactionProposalStatus,
} from './transaction-proposals.model';
import {
  EstimateFeesDeps,
  estimateFeesDeps,
  TransactionProposalsService,
} from './transaction-proposals.service';

@Resolver(() => TransactionProposal)
export class TransactionProposalsResolver {
  constructor(private service: TransactionProposalsService) {}

  @Query(() => TransactionProposal, { nullable: true })
  async transactionProposal(
    @Input() { id }: UniqueProposalInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.selectUnique(id, getShape(info));
  }

  @Query(() => [TransactionProposal])
  async transactionProposals(
    @Input() input: TransactionProposalsInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
  }

  @ComputedField<typeof e.TransactionProposal>(() => Boolean, { status: true })
  async updatable(@Parent() { status }: TransactionProposal): Promise<boolean> {
    return (
      status === TransactionProposalStatus.Pending || status === TransactionProposalStatus.Failed
    );
  }

  @ComputedField<typeof e.TransactionProposal>(() => EstimatedTransactionFees, estimateFeesDeps)
  async estimatedFees(@Parent() deps: EstimateFeesDeps): Promise<EstimatedTransactionFees> {
    return this.service.estimateFees(deps);
  }

  @Mutation(() => TransactionProposal)
  async proposeTransaction(
    @Input() input: ProposeTransactionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const { id } = await this.service.propose(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => TransactionProposal)
  async approveTransaction(@Input() input: ApproveInput, @Info() info: GraphQLResolveInfo) {
    await this.service.approve(input);
    return this.service.selectUnique(input.id, getShape(info));
  }

  @Mutation(() => TransactionProposal)
  async updateTransaction(
    @Input() input: UpdateTransactionProposalInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    await this.service.update(input);
    return this.service.selectUnique(input.id, getShape(info));
  }

  @Mutation(() => ID, { nullable: true })
  async removeTransaction(@Input() { id }: UniqueProposalInput): Promise<uuid | null> {
    return this.service.delete(id);
  }

  @Mutation(() => TransactionProposal, { nullable: true })
  async execute(
    @Input() { id, ignoreSimulation }: ExecuteTransactionProposalInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    this.service.tryExecute(id, ignoreSimulation);
    return this.service.selectUnique(id, getShape(info));
  }
}
