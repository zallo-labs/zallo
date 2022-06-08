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
import { Address } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { ProviderService } from '~/provider/provider.service';
import { getSelect } from '~/util/test';
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
    @Args() { safe, txHash }: SubmissionsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Submission[]> {
    const submissions = await this.prisma.tx
      .findUnique({
        where: { safeId_hash: { safeId: safe, hash: txHash } },
      })
      .submissions({
        ...getSelect(info),
      });

    return await this.service.updateUnfinalized(submissions);
  }

  @ResolveField(() => String)
  id(@Parent() submission: Submission): string {
    return submission.hash;
  }

  @Mutation(() => Submission)
  async submitTxExecution(
    @Args() { safe, txHash, submission }: SubmitTxExecutionArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Submission> {
    if (!(await this.isValid(safe, txHash, submission.hash)))
      throw new UserInputError("Submission doesn't match transaction");

    const transaction = await this.provider.getTransaction(submission.hash);
    if (!transaction) throw new UserInputError('Transaction not found');

    // const submissions = await this.prisma.tx
    //   .update({
    //     where: { safeId_hash: { safeId: safe, hash: txHash } },
    //     data: {
    //       submission: {
    //         create: {
    //           hash: submission.hash,
    //           nonce: transaction.nonce,
    //           gasLimit: BigInt(transaction.gasLimit.toString()),
    //           gasPrice: transaction.gasPrice
    //             ? BigInt(transaction.gasPrice.toString())
    //             : undefined,
    //           finalized: this.service.isFinalised(transaction),
    //         },
    //       },
    //     },
    //   })
    //   .submission({ ...getSelect(info) });

    return await this.prisma.submission.create({
      data: {
        tx: {
          connect: { safeId_hash: { safeId: safe, hash: txHash } },
        },
        hash: submission.hash,
        nonce: transaction.nonce,
        gasLimit: BigInt(transaction.gasLimit.toString()),
        gasPrice: transaction.gasPrice
          ? BigInt(transaction.gasPrice.toString())
          : undefined,
        finalized: this.service.isFinalised(transaction),
      },
      ...getSelect(info),
    });
  }

  private async isValid(safe: Address, txHash: string, submissionHash: string) {
    // TODO: verify submission is valid
    return true;
  }
}
