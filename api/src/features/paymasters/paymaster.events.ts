import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { TransactionEventData, TransactionsWorker } from '../transactions/transactions.worker';
import { decodeEventLog, getAbiItem } from 'viem';
import { PAYMASTER, asAddress, asHex, asUAddress, asDecimal, tryOrIgnore } from 'lib';
import { AccountsCacheService } from '~/features/auth/accounts.cache.service';
import e from '~/edgeql-js';
import { ETH } from 'lib/dapps';
import { DatabaseService } from '~/features/database/database.service';
import { and } from '~/features/database/database.util';
import { selectAccount } from '~/features/accounts/accounts.util';

@Injectable()
export class PaymasterEvents {
  constructor(
    private db: DatabaseService,
    @Inject(forwardRef(() => TransactionsWorker))
    private transactions: TransactionsWorker,
    private accountsCache: AccountsCacheService,
  ) {
    this.transactions.onEvent(getAbiItem({ abi: PAYMASTER.abi, name: 'RefundCredit' }), (event) =>
      this.refundCredit(event),
    );
  }

  private async refundCredit({ chain, log, receipt }: TransactionEventData) {
    const r = tryOrIgnore(() =>
      decodeEventLog({
        abi: PAYMASTER.abi,
        eventName: 'RefundCredit',
        data: log.data,
        topics: log.topics,
      }),
    );
    if (!r) return;

    const account = asUAddress(r.args.account, chain);
    if (!(await this.accountsCache.isAccount(account))) return;

    const selectedAccount = selectAccount(account);
    const transaction = e.assert_single(
      e.select(e.Transaction, (t) => ({
        filter: and(
          e.op(t.hash, '=', asHex(receipt.transactionHash)),
          e.op(t.proposal.paymaster, '=', asAddress(log.address)),
          e.op(t.proposal.account, '=', selectedAccount),
        ),
      })),
    );

    const ethAmount = e.decimal(asDecimal(r.args.amount, ETH).toString());

    await this.db.transaction(async (db) => {
      const refund = await e
        .insert(e.Refund, {
          transaction,
          ethAmount,
        })
        .unlessConflict()
        .run(db);

      // Refund may have already been granted
      if (refund) {
        await e
          .update(selectedAccount, (a) => ({
            set: {
              paymasterEthCredit: e.op(a.paymasterEthCredit, '+', ethAmount),
            },
          }))
          .run(db);
      }
    });
  }
}
