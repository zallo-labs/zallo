import { Submission } from '@gen/submission/submission.model';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { GraphQLResolveInfo } from 'graphql';
import { Address, Id, toId } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { ProviderService } from '~/provider/provider.service';
import { getSelect } from '~/util/select';
import { SubmissionsArgs, SubmitTxExecutionArgs } from './submissions.args';
import { SubmissionsService } from './submissions.service';

@Resolver(() => Submission)
export class SubmissionsResolver {
  constructor(
    private service: SubmissionsService,
    private prisma: PrismaService,
    private provider: ProviderService,
  ) {}

  @Query(() => [Submission])
  async submissions(
    @Args() { account, txHash }: SubmissionsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Submission[]> {
    const submissions = await this.prisma.tx
      .findUnique({
        where: { accountId_hash: { accountId: account, hash: txHash } },
      })
      .submissions({
        ...getSelect(info),
      });

    return await this.service.updateUnfinalized(submissions);
  }

  @ResolveField(() => String)
  id(@Parent() submission: Submission): Id {
    return toId(submission.hash);
  }

  @Mutation(() => Submission)
  async submitTxExecution(
    @Args() { account, txHash, submission }: SubmitTxExecutionArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Submission> {
    if (!(await this.isValid(account, txHash, submission.hash)))
      throw new UserInputError("Submission doesn't match transaction");

    const transaction = await this.provider.getTransaction(submission.hash);
    if (!transaction) throw new UserInputError('Transaction not found');

    return await this.prisma.submission.create({
      data: {
        tx: {
          connect: { accountId_hash: { accountId: account, hash: txHash } },
        },
        hash: submission.hash,
        nonce: transaction.nonce,
        gasLimit: transaction.gasLimit.toString(),
        gasPrice: transaction.gasPrice?.toString(),
        finalized: this.service.isFinalised(transaction),
      },
      ...getSelect(info),
    });
  }

  private async isValid(
    account: Address,
    txHash: string,
    submissionHash: string,
  ) {
    // TODO: verify submission is valid
    return true;
  }
}
