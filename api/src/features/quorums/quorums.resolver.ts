import { PrismaService } from 'nestjs-prisma';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Quorum } from '@gen/quorum/quorum.model';
import { ProposableStatus, ProposableState } from '../wallets/proposable.args';

@Resolver(() => Quorum)
export class QuorumsResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField(() => ProposableState, { nullable: true })
  async state(@Parent() q: Quorum): Promise<ProposableState | null> {
    const { createProposal, removeProposal } =
      await this.prisma.quorum.findUniqueOrThrow({
        where: {
          accountId_walletRef_hash: {
            accountId: q.accountId,
            walletRef: q.walletRef,
            hash: q.hash,
          },
        },
        select: {
          createProposal: {
            select: {
              hash: true,
              createdAt: true,
              submissions: {
                where: { finalized: true },
              },
            },
          },
          removeProposal: {
            select: {
              hash: true,
              createdAt: true,
              submissions: {
                where: { finalized: true },
              },
            },
          },
        },
      });

    // remove | deleted if it has a removeProposal that is newer than the create proposal
    if (
      removeProposal &&
      (!createProposal || removeProposal.createdAt > createProposal.createdAt)
    ) {
      if (removeProposal.submissions.length) return null;

      return {
        status: ProposableStatus.remove,
        proposedModificationHash: removeProposal.hash,
      };
    }

    // Otherwise, active if the create proposal has a finalized submission otherwise it is added
    if (createProposal?.submissions.length)
      return { status: ProposableStatus.active };

    return {
      status: ProposableStatus.add,
      proposedModificationHash: createProposal?.hash,
    };
  }
}
