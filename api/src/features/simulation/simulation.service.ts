import { Injectable } from '@nestjs/common';
import { Address, asAddress, Tx } from 'lib';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { OperationsService } from '../operations/operations.service';
import { SwapOp, TransferFromOp, TransferOp } from '../operations/operations.model';

type TransferDetails = Parameters<typeof e.insert<typeof e.TransferDetails>>[1];

@Injectable()
export class SimulationService {
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
          token: asAddress(ETH_ADDRESS),
          amount: -op.value,
        });
      }

      const f = op.data && (await this.operations.decodeCustom(op.to, op.data!));
      if (f instanceof TransferOp) {
        transfers.push({
          account,
          direction: 'Out',
          from: accountAddress,
          to: f.to,
          token: f.token,
          amount: -f.amount,
        });
      } else if (f instanceof TransferFromOp) {
        transfers.push({
          account,
          direction: 'In',
          from: f.from,
          to: f.to,
          token: f.token,
          amount: f.amount,
        });
      } else if (f instanceof SwapOp) {
        transfers.concat(
          {
            account,
            direction: 'Out',
            from: accountAddress,
            to: op.to,
            token: f.fromToken,
            amount: -f.fromAmount,
          },
          {
            account,
            direction: 'In',
            from: op.to,
            to: accountAddress,
            token: f.toToken,
            amount: f.minimumToAmount,
          },
        );
      }
    }

    return e.insert(e.Simulation, {
      ...(transfers.length && {
        transfers: e.set(...transfers.map((t) => e.insert(e.TransferDetails, t))),
      }),
    });
  }
}
