import { TransactionResponse } from '@gen/transaction-response/transaction-response.model';
import { Transaction } from '@gen/transaction/transaction.model';
import { ID, Info, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaService } from 'nestjs-prisma';
import { getSelect } from '~/util/select';
import { SubgraphService } from '../subgraph/subgraph.service';

@Resolver(() => Transaction)
export class TransactionsResolver {
  constructor(private prisma: PrismaService, private subgraph: SubgraphService) {}

  @ResolveField(() => ID)
  id(@Parent() submission: Transaction): string {
    return submission.hash;
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
}
