import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
import { BigNumber } from 'ethers';
import { address, executeTx, LimitPeriod, Signer, toTxSalt, TxReq, User } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { TransactionResponse } from 'zksync-web3/build/src/types';
import { ProviderService } from '~/provider/provider.service';
import { SubgraphService } from '../subgraph/subgraph.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private subgraph: SubgraphService,
  ) {}

  async tryExecute(id: string) {
    const proposal = await this.prisma.proposal.findUniqueOrThrow({
      where: { id },
      include: {
        approvals: true,
        config: {
          select: {
            _count: {
              select: {
                approvers: true,
              },
            },
            state: {
              select: {
                configs: {
                  select: {
                    approvers: true,
                    limits: true,
                    spendingAllowlisted: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Ensure there is sufficient approval
    if (proposal.approvals.length < proposal.config._count.approvers + 1) return undefined;

    const signers: Signer[] = proposal.approvals
      .filter((approval) => approval.signature)
      .map((approval) => ({
        approver: address(approval.deviceId),
        signature: approval.signature!,
      }));

    const txReq: TxReq = {
      to: address(proposal.to),
      value: BigNumber.from(proposal.value),
      data: proposal.data,
      salt: toTxSalt(proposal.salt),
      gasLimit: proposal.gasLimit ? BigNumber.from(proposal.gasLimit) : undefined,
    };

    const user: User = {
      addr: address(proposal.proposerId),
      configs: proposal.config.state.configs.map((c) => ({
        approvers: c.approvers.map((a) => address(a.deviceId)),
        spendingAllowlisted: c.spendingAllowlisted,
        limits: Object.fromEntries(
          c.limits
            .map((l) => ({
              token: address(l.token),
              amount: BigNumber.from(l.amount),
              period: l.period as LimitPeriod,
            }))
            .map((l) => [l.token, l]),
        ),
      })),
    };

    const account = this.provider.connectAccount(address(proposal.accountId));

    const resp = await executeTx(account, txReq, user, signers);
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
