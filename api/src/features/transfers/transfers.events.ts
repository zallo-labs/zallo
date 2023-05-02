import { Injectable } from '@nestjs/common';
import { PrismaService } from '../util/prisma/prisma.service';
import { Erc20__factory, asAddress, asBigInt, tryOrIgnore } from 'lib';
import {
  TransactionEventData,
  TransactionsProcessor,
} from '../transactions/transactions.processor';
import { ListenerData, EventsProcessor } from '../events/events.processor';
import { TransferDirection } from '@prisma/client';

const ERC20 = Erc20__factory.createInterface();

@Injectable()
export class TransfersEvents {
  constructor(
    private eventsProcessor: EventsProcessor,
    private transactionsProcessor: TransactionsProcessor,
    private prisma: PrismaService,
  ) {
    this.eventsProcessor.on(
      ERC20.getEventTopic(ERC20.events['Transfer(address,address,uint256)']),
      (data) => this.transfer(data, false),
    );
    this.transactionsProcessor.onEvent(
      ERC20.getEventTopic(ERC20.events['Transfer(address,address,uint256)']),
      (data) => this.transfer(data, true),
    );
  }

  private async transfer(
    { log }: ListenerData | TransactionEventData,
    isTransactionEvent: boolean,
  ) {
    const r = tryOrIgnore(() =>
      ERC20.decodeEventLog(ERC20.events['Transfer(address,address,uint256)'], log.data, log.topics),
    );
    if (!r) return;
    const [from, to, amount] = [asAddress(r.from), asAddress(r.to), asBigInt(r.value)];

    const accounts = (
      await this.prisma.asSystem.account.findMany({
        where: { id: { in: [from, to] } },
        select: { id: true },
      })
    ).map((a) => a.id);

    await Promise.all(
      accounts.map(async (accountId) => {
        if (!isTransactionEvent && !!accounts.find((a) => a === from)) return;

        await this.prisma.asSystem.transfer.create({
          data: {
            accountId,
            token: asAddress(log.address),
            from,
            to,
            amount: amount.toString(),
            transactionHash: isTransactionEvent ? log.transactionHash : null,
            direction: accountId === from ? TransferDirection.OUT : TransferDirection.IN,
            blockNumber: log.blockNumber,
          },
          select: null,
        });
      }),
    );
  }
}
