import { Injectable } from '@nestjs/common';
import { Address, Tx, ZERO_ADDR } from 'lib';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { OperationsService } from '../operations/operations.service';
import { SwapOp, TransferFromOp, TransferOp } from '../operations/operations.model';

type TransferDetails = Parameters<typeof e.insert<typeof e.TransferDetails>>[1];

@Injectable()
export class SimulationsService {
  constructor(private operations: OperationsService) {}

  async getInsert(accountAddress: Address, { operations }: Tx) {
    const account = selectAccount(accountAddress);
    const transfers: TransferDetails[] = [];

    for (const op of operations) {
      if (op.value) {
        transfers.push({
          account,
          direction: 'Out',
          from: accountAddress,
          to: op.to,
          tokenAddress: ZERO_ADDR,
          amount: -op.value,
        });
      }

      const f = await this.operations.decodeCustom(op);
      if (f instanceof TransferOp && f.token !== ZERO_ADDR) {
        transfers.push({
          account,
          direction: 'Out',
          from: accountAddress,
          to: f.to,
          tokenAddress: f.token,
          amount: -f.amount,
        });
      } else if (f instanceof TransferFromOp) {
        transfers.push({
          account,
          direction: e.cast(e.TransferDirection, 'In' satisfies TransferDetails['direction']),
          from: f.from,
          to: f.to,
          tokenAddress: f.token,
          amount: f.amount,
        });
      } else if (f instanceof SwapOp) {
        transfers.push({
          account,
          direction: e.cast(e.TransferDirection, 'In' satisfies TransferDetails['direction']),
          from: op.to,
          to: accountAddress,
          tokenAddress: f.toToken,
          amount: f.minimumToAmount,
        });
      }
    }

    return e.insert(e.Simulation, {
      ...(transfers.length && {
        transfers: e.set(...transfers.map((t) => e.insert(e.TransferDetails, t))),
      }),
    });
  }
}
