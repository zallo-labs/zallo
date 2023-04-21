import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../util/prisma/prisma.service';
import { Job } from 'bull';
import { ProviderService } from '../util/provider/provider.service';
import { AccountsService } from './accounts.service';
import { AccountEvent } from './accounts.args';
import { ACCOUNTS_QUEUE, AccountActivationEvent } from './accounts.queue';

@Injectable()
@Processor(ACCOUNTS_QUEUE.name)
export class AccountsProcessor {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private accounts: AccountsService,
  ) {}

  @OnQueueFailed()
  onFailed(job: Job<AccountActivationEvent>, error: unknown) {
    Logger.error('Account queue job failed', { job, error });
  }

  @Process()
  async process(job: Job<AccountActivationEvent>) {
    const { account, transaction } = job.data;
    const receipt = await this.provider.getTransactionReceipt(transaction);
    if (receipt.status !== 1) {
      // TODO: handle failed activation
      Logger.error('Account activation transaction failed', { account, transaction });
      return;
    }

    const { isActive, policyStates: states } = await this.prisma.asUser.account.findUniqueOrThrow({
      where: { id: account },
      select: {
        isActive: true,
        // Initialization rules
        policyStates: {
          where: { proposal: null },
          select: {
            id: true,
            policyKey: true,
          },
        },
      },
    });
    if (isActive) {
      Logger.warn('Account is already active', { account });
      return;
    }

    await this.prisma.asUser.account.update({
      where: { id: account },
      data: {
        isActive: true,
        policies: {
          update: states.map((r) => ({
            where: { accountId_key: { accountId: account, key: r.policyKey } },
            data: { activeId: r.id, draftId: null },
          })),
        },
      },
      select: null,
    });

    this.accounts.publishAccount({ account: { id: account }, event: AccountEvent.update });
  }
}
