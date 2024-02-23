import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { TransactionEventData, ReceiptsWorker } from '../system-txs/receipts.worker';
import { getAbiItem } from 'viem';
import { PAYMASTER, asAddress, asHex, asUAddress, asDecimal } from 'lib';
import { AccountsCacheService } from '~/features/auth/accounts.cache.service';
import e from '~/edgeql-js';
import { ETH } from 'lib/dapps';
import { DatabaseService } from '~/features/database/database.service';
import { and } from '~/features/database/database.util';
import { selectAccount } from '~/features/accounts/accounts.util';

const refundCreditEvent = getAbiItem({ abi: PAYMASTER.abi, name: 'RefundCredit' });

@Injectable()
export class PaymasterEvents {
  constructor(
    private db: DatabaseService,
    @Inject(forwardRef(() => ReceiptsWorker))
    private receipts: ReceiptsWorker,
    private accountsCache: AccountsCacheService,
  ) {
    this.receipts.onEvent(refundCreditEvent, (e) => this.refundCredit(e));
  }

  private async refundCredit({
    chain,
    log,
    receipt,
  }: TransactionEventData<typeof refundCreditEvent>) {
    const { args } = log;

    const account = asUAddress(args.account, chain);
    if (!(await this.accountsCache.isAccount(account))) return;

    const selectedAccount = selectAccount(account);
    const systx = e.assert_single(
      e.select(e.SystemTx, (t) => ({
        filter: and(
          e.op(t.hash, '=', asHex(receipt.transactionHash)),
          e.op(t.proposal.paymaster, '=', asAddress(log.address)),
          e.op(t.proposal.account, '=', selectedAccount),
        ),
      })),
    );

    const ethAmount = e.decimal(asDecimal(args.amount, ETH).toString());

    await this.db.transaction(async (db) => {
      const refund = await e.insert(e.Refund, { systx, ethAmount }).unlessConflict().run(db);

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
