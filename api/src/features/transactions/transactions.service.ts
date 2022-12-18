import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
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
import { TransactionResponse } from 'zksync-web3/build/src/types';
import { ProviderService } from '~/provider/provider.service';
import { QuorumsService } from '../quorums/quorums.service';
import { SubgraphService } from '../subgraph/subgraph.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private subgraph: SubgraphService,
    @Inject(forwardRef(() => QuorumsService))
    private quorums: QuorumsService,
  ) {}

  async tryExecute(id: string) {
    const proposal = await this.prisma.proposal.findUniqueOrThrow({
      where: { id },
      include: {
        approvals: {
          select: {
            userId: true,
            signature: true,
          },
        },
      },
    });

    const quorum = await this.quorums.activeState(
      {
        account: address(proposal.accountId),
        key: toQuorumKey(proposal.quorumKey),
      },
      {
        include: {
          approvers: { select: { userId: true } },
          limits: true,
        },
      },
    );

    if (!quorum) return undefined;

    const signers: Signer[] = proposal.approvals
      .filter((approval) => approval.signature)
      .map((approval) => ({
        approver: address(approval.userId),
        signature: approval.signature!, // Rejections are filtered out
      }));

    if (quorum.approvers.length < signers.length) return undefined;

    const resp = await executeTx({
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
          limit: Object.fromEntries(
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

    return this.submitExecution(id, resp);
  }

  async submitExecution(
    proposalId: string,
    submission: TransactionResponse | string,
    args: Omit<Prisma.TransactionCreateArgs, 'data'> = {},
  ) {
    const transaction =
      typeof submission === 'object' ? submission : await this.provider.getTransaction(submission);
    if (!transaction) throw new UserInputError('Transaction not found');

    return await this.prisma.transaction.create({
      ...args,
      data: {
        proposal: { connect: { id: proposalId } },
        hash: transaction.hash,
        nonce: transaction.nonce,
        gasLimit: transaction.gasLimit.toString(),
        gasPrice: transaction.gasPrice?.toString(),
        response: { create: await this.subgraph.txResponse(proposalId) },
      },
    });
  }
}
