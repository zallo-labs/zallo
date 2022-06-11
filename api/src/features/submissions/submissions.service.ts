import { Submission } from '@gen/submission/submission.model';
import { Injectable } from '@nestjs/common';
import { filterAsync } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { TransactionResponse } from 'zksync-web3/build/types';
import { ProviderService } from '~/provider/provider.service';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService, private provider: ProviderService) {}

  async updateUnfinalized(submissions: Submission[]): Promise<Submission[]> {
    const subsToUpdate = await filterAsync(
      submissions,
      async (submission, i) => {
        if (submission.finalized) return false;

        const transaction = await this.provider.getTransaction(submission.hash);
        if (!transaction || !this.isFinalised(transaction)) return false;

        submissions[i].finalized = true;
        return true;
      },
    );

    if (subsToUpdate.length) {
      await this.prisma.submission.updateMany({
        where: { hash: { in: subsToUpdate.map((s) => s.hash) } },
        data: { finalized: true },
      });
    }

    return submissions;
  }

  isFinalised(transaction: TransactionResponse) {
    return transaction.confirmations >= 7;
  }
}
