import { SubmissionResponse } from '@gen/submission-response/submission-response.model';
import { Submission } from '@gen/submission/submission.model';
import { Args, Info, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Id, toId } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { getSelect } from '~/util/select';
import { SubgraphService } from '../subgraph/subgraph.service';
import { SubmitExecutionArgs } from './submissions.args';
import { SubmissionsService } from './submissions.service';

@Resolver(() => Submission)
export class SubmissionsResolver {
  constructor(
    private service: SubmissionsService,
    private prisma: PrismaService,
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
    return this.service.submitExecution(proposalHash, submission.hash, getSelect(info));
  }
}
