import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserInputError } from '@nestjs/apollo';
import {
  hashTx,
  Address,
  Hex,
  isHex,
  asTx,
  estimateTransactionOperationsGas,
  FALLBACK_OPERATIONS_GAS,
} from 'lib';
import { ProviderService } from '~/features/util/provider/provider.service';
import { TransactionsService } from '../transactions/transactions.service';
import {
  OperationInput,
  ProposeTransactionInput,
  TransactionProposalsInput,
  UpdateTransactionProposalInput,
} from './transaction-proposals.input';
import { ExpoService } from '../util/expo/expo.service';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import { and } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.util';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import { ApproveInput, ProposalEvent } from '../proposals/proposals.input';
import { SimulationsService } from '../simulations/simulations.service';

export const selectTransactionProposal = (
  id: UniqueProposal,
  shape?: ShapeFunc<typeof e.TransactionProposal>,
) =>
  e.select(e.TransactionProposal, (p) => ({
    ...shape?.(p),
    filter_single: isHex(id) ? { hash: id } : { id },
  }));

@Injectable()
export class TransactionProposalsService {
  constructor(
    private db: DatabaseService,
    private provider: ProviderService,
    private expo: ExpoService,
    private proposals: ProposalsService,
    @Inject(forwardRef(() => TransactionsService))
    private transactions: TransactionsService,
    private simulations: SimulationsService,
  ) {}

  async selectUnique(id: UniqueProposal, shape?: ShapeFunc<typeof e.TransactionProposal>) {
    return this.db.query(selectTransactionProposal(id, shape));
  }

  async select(
    { accounts, statuses }: TransactionProposalsInput = {},
    shape?: ShapeFunc<typeof e.TransactionProposal>,
  ) {
    return this.db.query(
      e.select(e.TransactionProposal, (p) => ({
        ...shape?.(p),
        filter: and(
          accounts && e.op(p.account, 'in', e.set(...accounts.map((a) => selectAccount(a)))),
          statuses &&
            e.op(
              p.status,
              'in',
              e.set(...statuses.map((s) => e.cast(e.TransactionProposalStatus, s))),
            ),
        ),
      })),
    );
  }

  async getProposal({
    account,
    operations,
    label,
    iconUri,
    validFrom = new Date(),
    gasLimit,
    feeToken = ETH_ADDRESS as Address,
  }: Omit<ProposeTransactionInput, 'signature'>) {
    if (!operations.length) throw new UserInputError('No operations provided');

    const selectedAccount = selectAccount(account);
    const tx = asTx({
      operations: operations as [OperationInput, ...OperationInput[]],
      nonce: BigInt(Math.floor(validFrom.getTime() / 1000)),
    });
    const hash = hashTx(account, tx);

    const insert = e.insert(e.TransactionProposal, {
      hash,
      account: selectedAccount,
      label,
      iconUri,
      operations: e.set(
        ...operations.map((op) =>
          e.insert(e.Operation, {
            to: op.to,
            value: op.value,
            data: op.data,
          }),
        ),
      ),
      validFrom,
      gasLimit:
        gasLimit ||
        (await estimateTransactionOperationsGas(this.provider, account, tx)).unwrapOr(
          FALLBACK_OPERATIONS_GAS,
        ),
      feeToken: this.selectFeeToken(feeToken),
    });

    this.db.afterTransaction(() => {
      this.simulations.request({ transactionProposalHash: hash });
      this.proposals.publishProposal({ account, hash }, ProposalEvent.create);
    });

    return { insert, hash };
  }

  propose({ signature, ...args }: ProposeTransactionInput) {
    return this.db.transaction(async (db) => {
      console.log(`[${args.gasLimit}]: start`);
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      const start = performance.now();

      const { hash, insert } = await this.getProposal(args);
      const { id } = await insert.run(db);

      if (signature) await this.approve({ hash, signature });

      console.log(`[${args.gasLimit}]: end (${Math.floor(performance.now() - start)}ms)`);

      return { id, hash };
    });
  }

  async approve(input: ApproveInput) {
    await this.proposals.approve(input);
    await this.transactions.tryExecute(input.hash);
  }

  async update({ hash, policy, feeToken: feeTokenAddress }: UpdateTransactionProposalInput) {
    const updatedProposal = e.assert_single(
      e.update(e.TransactionProposal, (p) => ({
        filter: and(
          e.op(p.hash, '=', hash),
          // Require proposal to be pending or failed
          e.op(
            p.status,
            'in',
            e.set(e.TransactionProposalStatus.Pending, e.TransactionProposalStatus.Failed),
          ),
        ),
        set: {
          ...(policy !== undefined && {
            policy:
              policy !== null
                ? e.select(e.Policy, () => ({ filter_single: { account: p.account, key: policy } }))
                : null,
          }),
          feeToken: feeTokenAddress && this.selectFeeToken(feeTokenAddress),
        },
      })),
    );

    const p = await this.db.query(
      e.select(updatedProposal, () => ({
        hash: true,
        account: {
          address: true,
        },
      })),
    );

    if (policy !== undefined && p) await this.transactions.tryExecute(p.hash);

    if (p) {
      this.proposals.publishProposal(
        { hash: p.hash as Hex, account: p.account.address as Address },
        ProposalEvent.update,
      );
    }

    return p;
  }

  async delete(id: UniqueProposal) {
    return this.db.transaction(async (db) => {
      // 1. Policies the proposal was going to create
      // Delete policies the proposal was going to activate
      const proposalPolicies = e.select(e.TransactionProposal, (p) => ({
        filter_single: isHex(id) ? { hash: id } : { id },
        beingCreated: e.select(p['<proposal[is PolicyState]'], (ps) => ({
          filter: e.op(e.count(ps.policy.stateHistory), '=', 1),
          policy: () => ({ id: true }),
        })),
      }));

      // TODO: use policies service instead? Ensures nothing weird happens
      await e.for(e.set(proposalPolicies.beingCreated.policy), (p) => e.delete(p)).run(db);

      return e.delete(selectTransactionProposal(id)).id.run(db);
    });
  }

  private selectFeeToken(feeTokenAddress: Address) {
    return e.assert_single(
      e.select(e.Token, (t) => ({
        filter: and(e.op(t.address, '=', feeTokenAddress), e.op(t.isFeeToken, '=', true)),
        limit: 1,
        id: true,
        isFeeToken: true,
      })),
    );
  }
}
