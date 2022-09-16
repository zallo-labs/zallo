import { SubmissionResponse } from '@gen/submission-response/submission-response.model';
import { Submission } from '@gen/submission/submission.model';
import {
  Args,
  Info,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { GraphQLResolveInfo } from 'graphql';
import { Id, toId } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { ProviderService } from '~/provider/provider.service';
import { getSelect } from '~/util/select';
import { SubgraphService } from '../subgraph/subgraph.service';
import { SubmitExecutionArgs } from './submissions.args';

@Resolver(() => Submission)
export class SubmissionsResolver {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private subgraph: SubgraphService,
  ) {}

  @ResolveField(() => String)
  id(@Parent() submission: Submission): Id {
    return toId(submission.hash);
  }

  @ResolveField(() => SubmissionResponse, { nullable: true })
  async response(
    @Parent() submission: Submission,
    @Info() info: GraphQLResolveInfo,
  ): Promise<SubmissionResponse | null> {
    // Get transaction response from subgraph if not already in db
    if (submission.response) return submission.response;

    const response = await this.subgraph.txResponse(submission.hash);
    if (!response) return null;

    return this.prisma.submissionResponse.create({
      data: response,
      ...getSelect(info),
    });
  }

  @Mutation(() => Submission)
  async submitExecution(
    @Args()
    { proposalHash, submission }: SubmitExecutionArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Submission> {
    const transaction = await this.provider.getTransaction(submission.hash);
    if (!transaction) throw new UserInputError('Transaction not found');

    return await this.prisma.submission.create({
      data: {
        proposal: {
          connect: { hash: proposalHash },
        },
        hash: submission.hash,
        nonce: transaction.nonce,
        gasLimit: transaction.gasLimit.toString(),
        gasPrice: transaction.gasPrice?.toString(),
        response: await this.subgraph.txResponse(proposalHash),
      },
      ...getSelect(info),
    });
  }
}
