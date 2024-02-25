import { ID, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  ExecuteTransactionInput,
  ProposeCancelScheduledTransactionInput,
  ProposeTransactionInput,
  TransactionsInput,
  UpdateTransactionInput,
} from './transactions.input';
import { EstimatedTransactionFees, Transaction, TransactionStatus } from './transactions.model';
import { EstimateFeesDeps, TransactionsService, estimateFeesDeps } from './transactions.service';
import { getShape } from '../database/database.select';
import e from '~/edgeql-js';
import { Input } from '~/decorators/input.decorator';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { ComputedField } from '~/decorators/computed.decorator';
import { ApproveInput, UniqueProposalInput } from '../proposals/proposals.input';

@Resolver(() => Transaction)
export class TransactionsResolver {
  constructor(private service: TransactionsService) {}

  @Query(() => Transaction, { nullable: true })
  async transaction(@Input() { id }: UniqueProposalInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(id, getShape(info));
  }

  @Query(() => [Transaction])
  async transactions(@Input() input: TransactionsInput, @Info() info: GraphQLResolveInfo) {
    return this.service.select(input, getShape(info));
  }

  @ComputedField<typeof e.Transaction>(() => Boolean, { status: true })
  async updatable(@Parent() { status }: Transaction): Promise<boolean> {
    return status === TransactionStatus.Pending;
  }

  @ComputedField<typeof e.Transaction>(() => EstimatedTransactionFees, estimateFeesDeps)
  async estimatedFees(@Parent() deps: EstimateFeesDeps): Promise<EstimatedTransactionFees> {
    return this.service.estimateFees(deps);
  }

  @Mutation(() => Transaction)
  async proposeTransaction(
    @Input() input: ProposeTransactionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const { id } = await this.service.propose(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => Transaction)
  async proposeCancelScheduledTransaction(
    @Input() input: ProposeCancelScheduledTransactionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const { id } = await this.service.proposeCancelScheduledTransaction(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => Transaction)
  async approveTransaction(@Input() input: ApproveInput, @Info() info: GraphQLResolveInfo) {
    await this.service.approve(input);
    return this.service.selectUnique(input.id, getShape(info));
  }

  @Mutation(() => Transaction)
  async updateTransaction(
    @Input() input: UpdateTransactionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    await this.service.update(input);
    return this.service.selectUnique(input.id, getShape(info));
  }

  @Mutation(() => ID, { nullable: true })
  async removeTransaction(@Input() { id }: UniqueProposalInput): Promise<uuid | null> {
    return this.service.delete(id);
  }

  @Mutation(() => Transaction, { nullable: true })
  async execute(
    @Input() { id, ignoreSimulation }: ExecuteTransactionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    this.service.tryExecute(id, ignoreSimulation);
    return this.service.selectUnique(id, getShape(info));
  }
}
