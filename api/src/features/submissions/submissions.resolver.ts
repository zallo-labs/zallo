import { TransactionResponse } from '@gen/transaction-response/transaction-response.model';
import { Transaction } from '@gen/transaction/transaction.model';
import { Args, Info, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Id, toId } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { getSelect } from '~/util/select';
import { SubgraphService } from '../subgraph/subgraph.service';
import { SubmitExecutionArgs } from './submissions.args';
import { SubmissionsService } from './submissions.service';

@Resolver(() => Transaction)
export class SubmissionsResolver {
  constructor(
    private service: SubmissionsService,
    private prisma: PrismaService,
    private subgraph: SubgraphService,
  ) {}

  @ResolveField(() => String)
  id(@Parent() submission: Transaction): Id {
    return toId(submission.hash);
  }

  @ResolveField(() => TransactionResponse, { nullable: true })
  async response(
    @Parent() submission: Transaction,
    @Info() info: GraphQLResolveInfo,
  ): Promise<TransactionResponse | null> {
    // Get transaction response from subgraph if not already in db
    if (submission.response) return submission.response;

    const response = await this.subgraph.txResponse(submission.hash);
    if (!response) return null;

    return this.prisma.transactionResponse.create({
      data: response,
      ...getSelect(info),
    });
  }

  @Mutation(() => Transaction)
  async submitExecution(
    @Args()
    { proposalHash, submission }: SubmitExecutionArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Transaction> {
    return this.service.submitExecution(proposalHash, submission.hash, getSelect(info));
  }
}
