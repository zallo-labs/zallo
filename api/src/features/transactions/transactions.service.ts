import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UserInputError } from '@nestjs/apollo';
import {
  hashTx,
  Tx,
  estimateTransactionOperationsGas,
  FALLBACK_OPERATIONS_GAS,
  asAddress,
  asUAddress,
  asChain,
  ETH_ADDRESS,
  asTypedData,
  asUUID,
  UUID,
  estimateTransactionVerificationGas,
  ACCOUNT_ABI,
  asHex,
  isHex,
  Hex,
} from 'lib';
import { NetworksService } from '~/features/util/networks/networks.service';
import {
  ProposeCancelScheduledTransactionInput,
  ProposeTransactionInput,
  TransactionsInput,
  UpdateTransactionInput,
} from './transactions.input';
import { DatabaseService } from '../database/database.service';
import e, { $infer } from '~/edgeql-js';
import { Shape, ShapeFunc } from '../database/database.select';
import { and } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.util';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import { ApproveInput, ProposalEvent } from '../proposals/proposals.input';
import { PaymastersService } from '~/features/paymasters/paymasters.service';
import { EstimatedTransactionFees } from '~/features/transactions/transactions.model';
import Decimal from 'decimal.js';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { ExecutionsQueue } from '~/features/transactions/executions.worker';
import { FLOW_PRODUCER } from '../util/bull/bull.util';
import { QueueData, TypedQueue } from '~/features/util/bull/bull.util';
import { SimulationsQueue } from '~/features/simulations/simulations.worker';
import { TX_SHAPE, transactionAsTx } from '~/features/transactions/transactions.util';
import { encodeFunctionData, hashTypedData } from 'viem';
import { v4 as uuid } from 'uuid';
import { FlowProducer } from 'bullmq';
import { ActivationsService } from '../activations/activations.service';
import { totalPaymasterEthFees } from '../paymasters/paymasters.util';
import { ReceiptsQueue } from '../system-txs/receipts.queue';
import { PoliciesService } from '../policies/policies.service';

export const selectTransaction = (id: UUID | Hex) =>
  e.select(e.Transaction, () => ({
    filter_single: isHex(id) ? { hash: id } : { id },
  }));

export const estimateFeesDeps = {
  id: true,
  account: { address: true },
  gasLimit: true,
  maxPaymasterEthFees: {
    activation: true,
  },
} satisfies Shape<typeof e.Transaction>;
const s_ = e.assert_exists(e.assert_single(e.select(e.Transaction, () => estimateFeesDeps)));
export type EstimateFeesDeps = $infer<typeof s_>;

@Injectable()
export class TransactionsService {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private proposals: ProposalsService,
    private paymasters: PaymastersService,
    @InjectQueue(SimulationsQueue.name)
    private simulations: TypedQueue<SimulationsQueue>,
    @InjectFlowProducer(FLOW_PRODUCER)
    private flows: FlowProducer,
    private activations: ActivationsService,
    @Inject(forwardRef(() => PoliciesService))
    private policies: PoliciesService,
  ) {}

  async selectUnique(id: UniqueProposal, shape?: ShapeFunc<typeof e.Transaction>) {
    return this.db.query(
      e.select(e.Transaction, (t) => ({
        ...shape?.(t),
        filter_single: { id },
      })),
    );
  }

  async select(
    { accounts, statuses }: TransactionsInput = {},
    shape?: ShapeFunc<typeof e.Transaction>,
  ) {
    return this.db.query(
      e.select(e.Transaction, (p) => ({
        ...shape?.(p),
        filter: and(
          accounts && e.op(p.account, 'in', e.set(...accounts.map((a) => selectAccount(a)))),
          statuses &&
            e.op(p.status, 'in', e.set(...statuses.map((s) => e.cast(e.TransactionStatus, s)))),
        ),
      })),
    );
  }

  async tryExecute(txProposal: UUID, ignoreSimulation?: boolean) {
    const updatedProposal = e.update(selectTransaction(txProposal), () => ({
      set: { submitted: true },
    }));

    const t = await this.db.query(
      e.select(updatedProposal, () => ({ account: { address: true, isActive: true } })),
    );
    if (!t) throw new Error(`Transaction proposal not found: ${txProposal}`);
    const account = asUAddress(t.account.address);
    const chain = asChain(account);

    // activate -> simulate -> execute -> receipt
    this.flows.add({
      queueName: ReceiptsQueue.name,
      name: 'Transaction proposal',
      data: { chain, transaction: { child: 0 } } satisfies QueueData<ReceiptsQueue>,
      children: [
        {
          queueName: ExecutionsQueue.name,
          name: 'Execute transaction',
          data: { txProposal, ignoreSimulation } satisfies QueueData<ExecutionsQueue>,
          children: [
            {
              queueName: SimulationsQueue.name,
              name: 'Simulate transaction',
              data: { transaction: txProposal } satisfies QueueData<SimulationsQueue>,
              ...(!t.account.isActive && {
                children: [this.activations.activationFlow(account)],
              }),
            },
          ],
        },
      ],
    });

    this.proposals.publish({ id: txProposal, account }, ProposalEvent.submitted);
  }

  async getInsertProposal({
    account,
    operations,
    label,
    iconUri,
    dapp,
    validFrom = new Date(),
    gas,
    feeToken = ETH_ADDRESS,
  }: Omit<ProposeTransactionInput, 'signature'>) {
    if (!operations.length) throw new UserInputError('No operations provided');

    const chain = asChain(account);
    const network = this.networks.get(chain);
    const maxPaymasterEthFees = await this.paymasters.paymasterEthFees({ account, use: false });
    const tx = {
      operations,
      nonce: BigInt(Math.floor(validFrom.getTime() / 1000)),
      gas,
      feeToken,
      paymaster: this.paymasters.for(chain),
      paymasterEthFee: totalPaymasterEthFees(maxPaymasterEthFees),
    } satisfies Tx;
    const { policy, validationErrors } = await this.policies.best(account, tx);

    gas ??=
      (
        await estimateTransactionOperationsGas({ account: asAddress(account), tx, network })
      ).unwrapOr(FALLBACK_OPERATIONS_GAS) + estimateTransactionVerificationGas(3);

    const id = asUUID(uuid());
    const insert = e.insert(e.Transaction, {
      id,
      hash: hashTx(account, tx),
      account: selectAccount(account),
      policy,
      validationErrors,
      label,
      iconUri,
      dapp: dapp && {
        name: dapp.name,
        url: dapp.url.href,
        icons: dapp.icons.map((i) => i.href),
      },
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
      gasLimit: gas,
      paymaster: tx.paymaster,
      maxPaymasterEthFees: e.insert(e.PaymasterFees, {
        activation: maxPaymasterEthFees.activation.toString(),
      }),
      feeToken: e.assert_single(
        e.select(e.Token, (t) => ({
          filter: and(
            e.op(t.address, '=', e.op(asChain(account), '++', e.op(':', '++', feeToken))),
            e.op(t.isFeeToken, '=', true),
          ),
          limit: 1,
        })),
      ),
    });

    this.db.afterTransaction(() => {
      this.simulations.add(SimulationsQueue.name, { transaction: id });
      this.proposals.publish({ id, account }, ProposalEvent.create);
    });

    return insert;
  }

  async propose({ signature, ...args }: ProposeTransactionInput) {
    const id = await this.db.transaction(async (db) =>
      asUUID((await (await this.getInsertProposal(args)).run(db)).id),
    );

    if (signature) await this.approve({ id, signature });

    return { id };
  }

  async proposeCancelScheduledTransaction({
    proposal,
    ...params
  }: ProposeCancelScheduledTransactionInput) {
    const hash = await this.db.query(e.select(selectTransaction(proposal).hash));
    if (!hash) throw new UserInputError('Transaction proposal not found');

    return this.propose({
      ...params,
      operations: [
        {
          to: asAddress(params.account),
          data: encodeFunctionData({
            abi: ACCOUNT_ABI,
            functionName: 'cancelScheduledTransaction',
            args: [asHex(hash)],
          }),
        },
      ],
    });
  }

  async approve(input: ApproveInput) {
    await this.proposals.approve(input);
    this.tryExecute(input.id);
  }

  async update({ id, policy, feeToken }: UpdateTransactionInput) {
    const updatedProposal = e.assert_single(
      e.update(e.Transaction, (p) => ({
        filter: and(
          e.op(p.id, '=', e.uuid(id)),
          // Require proposal to be pending or failed
          e.op(p.status, 'in', e.set(e.TransactionStatus.Pending, e.TransactionStatus.Failed)),
        ),
        set: {
          ...(policy && {
            policy: e.select(e.Policy, () => ({
              filter_single: { account: p.account, key: policy },
            })),
          }),
          feeToken:
            feeToken &&
            e.assert_single(
              e.select(e.Token, (t) => ({
                filter: and(
                  e.op(t.address, '=', e.op(p.account.chain, '++', e.op(':', '++', feeToken))),
                  e.op(t.isFeeToken, '=', true),
                ),
                limit: 1,
              })),
            ),
        },
      })),
    );

    const p = await this.db.transaction(async (tx) => {
      const p = await e
        .select(updatedProposal, () => ({
          id: true,
          hash: true,
          account: { address: true },
          ...TX_SHAPE,
        }))
        .run(tx);
      if (!p) return;

      const hash = hashTypedData(asTypedData(asUAddress(p.account.address), transactionAsTx(p)));
      if (hash !== p.hash) {
        // Approvals are marked as invalid when the signed hash differs from the proposal hash
        await e
          .update(e.Transaction, (proposal) => ({
            filter: e.op(proposal.id, '=', e.uuid(id)),
            set: { hash },
          }))
          .run(tx);
      }

      return { ...p, hash };
    });
    if (!p) return;

    if (policy !== undefined) await this.tryExecute(id);

    this.proposals.publish(p, ProposalEvent.update);

    return p;
  }

  async delete(id: UniqueProposal) {
    return this.db.transaction(async () => {
      // 1. Policies the proposal was going to create
      // Delete policies the proposal was going to activate
      const selectedTransaction = e.select(e.Transaction, (t) => ({
        filter_single: { id },
        id: true,
        account: { address: true },
        beingCreated: e.select(t['<proposal[is PolicyState]'], (ps) => ({
          filter: e.op(e.count(ps.policy.stateHistory), '=', 1),
          policy: () => ({ id: true }),
        })),
      }));

      const { transaction: t } = await this.db.query(
        e.select({
          transaction: selectedTransaction,
          // TODO: use policies service instead? Ensures nothing weird happens
          deletedPolicies: e.for(e.set(selectedTransaction.beingCreated.policy), (p) =>
            e.delete(p),
          ),
          deletedTransaction: e.delete(selectedTransaction),
        }),
      );

      this.db.afterTransaction(() => this.proposals.publish(t, ProposalEvent.delete));

      return id;
    });
  }

  async estimateFees(d: EstimateFeesDeps): Promise<EstimatedTransactionFees> {
    const account = asUAddress(d.account.address);
    const maxEthFeePerGas = await this.paymasters.estimateMaxEthFeePerGas(asChain(account));
    const gasLimit = new Decimal(d.gasLimit.toString());
    const maxNetworkEthFee = maxEthFeePerGas.mul(gasLimit);

    return {
      id: `EstimatedTransactionFees:${d.id}`,
      maxNetworkEthFee,
      ...(await this.paymasters.estimateEthDiscount(account, maxNetworkEthFee, {
        activation: new Decimal(d.maxPaymasterEthFees.activation),
      })),
    };
  }
}
