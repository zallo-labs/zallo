import { BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { BigNumber } from 'ethers';
import {
  address,
  executeTx,
  TokenLimitPeriod,
  Signer,
  toTxSalt,
  toQuorumKey,
  toTx,
  TokenLimit,
} from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { ProviderService } from '~/features/util/provider/provider.service';

export interface TransactionResponseJob {
  transactionHash: string;
}

@Injectable()
export class TransactionsService {
  static readonly QUEUE_OPTIONS = {
    name: 'Transactions',
    defaultJobOptions: { attempts: 20 },
  } satisfies BullModuleOptions;

  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    @InjectQueue(TransactionsService.QUEUE_OPTIONS.name)
    private responseQueue: Queue<TransactionResponseJob>,
  ) {
    this.addMissingResponseJobs();
  }

  async tryExecute(proposalId: string) {
    const proposal = await this.prisma.proposal.findUniqueOrThrow({
      where: { id: proposalId },
      include: {
        approvals: {
          select: {
            userId: true,
            signature: true,
          },
        },
        quorum: {
          select: {
            activeState: {
              include: {
                approvers: { select: { userId: true } },
                limits: true,
              },
            },
          },
        },
      },
    });

    const quorum = proposal.quorum.activeState;
    if (!quorum) return undefined;

    const signers: Signer[] = proposal.approvals
      .filter((approval) => approval.signature)
      .map((approval) => ({
        approver: address(approval.userId),
        signature: approval.signature!, // Rejections are filtered out
      }));

    if (quorum.approvers.length < signers.length) return undefined;

    const transaction = await executeTx({
      account: this.provider.connectAccount(address(proposal.accountId)),
      tx: toTx({
        to: address(proposal.to),
        value: proposal.value ? BigNumber.from(proposal.value) : undefined,
        data: proposal.data ?? undefined,
        salt: toTxSalt(proposal.salt),
        gasLimit: proposal.gasLimit ? BigNumber.from(proposal.gasLimit.toString()) : undefined,
      }),
      quorum: {
        key: toQuorumKey(quorum.quorumKey),
        approvers: new Set(quorum.approvers.map((a) => address(a.userId))),
        spending: {
          fallback: quorum.spendingFallback,
          limits: Object.fromEntries(
            quorum.limits
              .map(
                (l): TokenLimit => ({
                  token: address(l.token),
                  amount: BigNumber.from(l.amount),
                  period: l.period as TokenLimitPeriod,
                }),
              )
              .map((l) => [l.token, l]),
          ),
        },
      },
      signers,
    });

    await this.prisma.transaction.create({
      data: {
        proposal: { connect: { id: proposalId } },
        hash: transaction.hash,
        nonce: transaction.nonce,
        gasLimit: transaction.gasLimit.toString(),
        gasPrice: transaction.gasPrice?.toString(),
      },
      select: {},
    });

    this.responseQueue.add({ transactionHash: transaction.hash }, { delay: 1000 /* 1s */ });
  }

  private async addMissingResponseJobs() {
    const jobs = (await this.responseQueue.getJobs(['waiting', 'active', 'delayed', 'paused'])).map(
      (job) => job.data,
    );

    const missingResponses = await this.prisma.transaction.findMany({
      where: {
        response: null,
        hash: { notIn: jobs.map((job) => job.transactionHash) },
      },
      select: {
        hash: true,
      },
    });

    return this.responseQueue.addBulk(
      missingResponses.map((r) => ({ data: { transactionHash: r.hash } })),
    );
  }
}
