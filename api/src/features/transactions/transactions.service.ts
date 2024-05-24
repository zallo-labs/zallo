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
import { ReceiptsQueue } from '../system-txs/receipts.queue';
import { PoliciesService } from '../policies/policies.service';
import { TokensService, preferUserToken } from '#/tokens/tokens.service';
import { PricesService } from '#/prices/prices.service';
import { totalPaymasterEthFees } from '#/paymasters/paymasters.util';
import Decimal from 'decimal.js';
import { afterRequest } from '#/util/context';
import { DEFAULT_FLOW_OPTIONS } from '#/util/bull/bull.module';

const MAX_NETWORK_FEE_MULTIPLIER = new Decimal(5); // Allow for a higher network fee

export const selectTransaction = (id: UUID | Hex) =>
  e.select(e.Transaction, () => ({
    filter_single: isHex(id) ? { hash: id } : { id },
  }));

export const estimateFeesDeps = {
  id: true,
  account: { address: true },
  gasLimit: true,
  paymasterEthFees: {
    total: true,
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
    private tokens: TokensService,
    private prices: PricesService,
  ) {}

  async selectUnique(id: UniqueProposal, shape?: ShapeFunc<typeof e.Transaction>) {
    return this.db.queryWith(
      { id: e.uuid },
      ({ id }) =>
        e.select(e.Transaction, (t) => ({
          ...shape?.(t),
          filter_single: { id },
        })),
      { id },
    );
  }

  async tryExecute(transaction: UUID, ignoreSimulation?: boolean) {
    const t = await this.db.query(
      e.select(e.Transaction, () => ({
        filter_single: { id: transaction },
        account: { address: true, active: true },
      })),
    );
    if (!t) throw new Error(`Transaction proposal not found: ${transaction}`);
    const account = asUAddress(t.account.address);
    const chain = asChain(account);

    // simulate -> (activate -> activation-receipt)? -> execute -> receipt
    this.flows.add(
      {
        queueName: ReceiptsQueue.name,
        name: 'Transaction proposal',
        data: {
          chain,
          transaction: { child: 0 },
          type: 'transaction',
        } satisfies QueueData<ReceiptsQueue>,
        children: [
          {
            queueName: ExecutionsQueue.name,
            name: 'Standard transaction',
            data: {
              transaction,
              ignoreSimulation,
              type: 'standard',
            } satisfies QueueData<ExecutionsQueue>,
            children: t.account.active
              ? [
                  {
                    queueName: SimulationsQueue.name,
                    name: 'Simulate transaction',
                    data: { transaction } satisfies QueueData<SimulationsQueue>,
                  },
                ]
              : [this.activations.flow(account, transaction) /* Includes simulation */],
          },
        ],
      },
      DEFAULT_FLOW_OPTIONS,
    );
  }

  async getInsertProposal({
    account,
    operations,
    label,
    icon,
    dapp,
    timestamp = new Date(),
    gas,
    feeToken = ETH_ADDRESS,
  }: Omit<ProposeTransactionInput, 'signature'>) {
    if (!operations.length) throw new UserInputError('No operations provided');

    const chain = asChain(account);
    const network = this.networks.get(chain);
    gas ??=
      (
        await estimateTransactionOperationsGas({ account: asAddress(account), network, operations })
      ).unwrapOr(FALLBACK_OPERATIONS_GAS) + estimateTransactionVerificationGas(3);

    const [maxFeePerGas, paymasterFees, feeTokenPrice] = await Promise.all([
      network.estimatedMaxFeePerGas(),
      this.paymasters.paymasterFees({ account }),
      this.prices.price(asUAddress(feeToken, chain)),
    ]);
    const maxNetworkFee = maxFeePerGas.mul(gas.toString()).mul(MAX_NETWORK_FEE_MULTIPLIER);
    const totalEthFees = maxNetworkFee.plus(totalPaymasterEthFees(paymasterFees));
    const maxAmount = totalEthFees.div(feeTokenPrice.eth);

    const tx = {
      operations,
      timestamp: BigInt(Math.floor(timestamp.getTime() / 1000)),
      gas,
      feeToken,
      paymaster: this.paymasters.for(chain),
      maxAmount: await this.tokens.asFp(asUAddress(feeToken, chain), maxAmount),
    } satisfies Tx;
    const { policy, validationErrors } = await this.policies.best(account, tx);

    // Ordering operation ids ensures
    const operationIds = operations.map(() => uuid()).sort((a, b) => a.localeCompare(b));
    const insertOperation = e.for(
      e.set(
        ...operations.map((op, i) =>
          e.json({
            id: operationIds[i],
            to: op.to,
            value: op.value,
            data: op.data,
          }),
        ),
      ),
      (op) =>
        e.insert(e.Operation, {
          id: e.cast(e.uuid, op.id),
          to: e.cast(e.Address, op.to),
          value: e.cast(e.uint256, e.cast(e.str, e.json_get(op, 'value'))),
          data: e.cast(e.Bytes, e.json_get(op, 'data')),
        }),
    );

    const id = asUUID(uuid());
    const insert = e.insert(e.Transaction, {
      id,
      hash: hashTx(account, tx),
      account: selectAccount(account),
      policy,
      validationErrors,
      label,
      icon,
      ...(dapp && {
        dapp: {
          name: dapp.name,
          url: dapp.url,
          icons: dapp.icons,
        },
      }),
      operations: insertOperation,
      timestamp,
      gasLimit: gas,
      feeToken: e.assert_single(
        e.select(e.token(asUAddress(feeToken, asChain(account))), (t) => ({
          filter: t.isFeeToken,
          limit: 1,
        })),
      ),
      paymaster: tx.paymaster,
      maxAmount: maxAmount.toString(),
      paymasterEthFees: e.insert(e.PaymasterFees, {
        activation: paymasterFees.activation.toString(),
      }),
    });

    afterRequest(() => this.simulations.add(SimulationsQueue.name, { transaction: id }));

    return insert;
  }

  async propose({ signature, ...args }: ProposeTransactionInput) {
    const id = asUUID((await this.db.query(await this.getInsertProposal(args))).id);

    if (signature) {
      await this.approve({ id, signature });
    } else {
      this.tryExecute(id);
    }

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
    const p = await this.db.query(
      e.assert_single(
        e.select(e.Transaction, (p) => ({
          filter: and(
            e.op(p.id, '=', e.uuid(id)),
            e.op(p.status, 'in', e.set(e.TransactionStatus.Pending, e.TransactionStatus.Failed)),
          ),
          hash: true,
          account: { address: true },
          paymasterEthFees: { total: true },
          maxAmount: true,
          ...TX_SHAPE,
        })),
      ),
    );
    if (!p) return;

    const account = asUAddress(p.account.address);

    let maxAmount = new Decimal(p.maxAmount);
    if (feeToken) {
      const network = this.networks.get(account);
      const [maxFeePerGas, feeTokenPrice] = await Promise.all([
        network.estimatedMaxFeePerGas(),
        this.prices.price(asUAddress(feeToken, network.chain.key)),
      ]);
      const newTotalEthFee = maxFeePerGas
        .mul(p.gasLimit.toString())
        .mul(MAX_NETWORK_FEE_MULTIPLIER)
        .plus(p.paymasterEthFees.total);
      maxAmount = newTotalEthFee.div(feeTokenPrice.eth);
    }

    const uFeeToken = asUAddress(feeToken ?? asAddress(p.feeToken.address), asChain(account));
    const tx: Tx = {
      ...transactionAsTx(p),
      feeToken,
      maxAmount: await this.tokens.asFp(uFeeToken, maxAmount),
    };

    await this.db.query(
      e.update(e.Transaction, (p) => ({
        filter_single: { id },
        set: {
          ...(policy && { policy: e.latestPolicy(p.account, policy) }),
          ...(feeToken && {
            hash: hashTypedData(asTypedData(account, tx)),
            feeToken: e.assert_single(
              e.select(e.Token, (t) => ({
                filter: and(e.op(t.address, '=', uFeeToken), e.op(t.isFeeToken, '=', true)),
                limit: 1,
              })),
            ),
            maxAmount: maxAmount.toString(),
          }),
        },
      })),
    );

    if (policy !== undefined) await this.tryExecute(id);

    this.proposals.publish({ id, account: p.account }, ProposalEvent.update);

    return { id };
  }

  async delete(id: UniqueProposal) {
    // 1. Policies the proposal was going to create
    // Delete policies the proposal was going to activate
    const selectedTransaction = selectTransaction(id);
    const { transaction: t } = await this.db.query(
      e.select({
        transaction: e.select(selectedTransaction, () => ({
          id: true,
          account: { address: true },
        })),
        deletedPolicies: e.assert_distinct(
          e.for(selectedTransaction['<proposal[is PolicyState]'], (p) => e.delete(p)),
        ),
        deletedTransaction: e.delete(selectedTransaction),
      }),
    );

    this.proposals.publish(t, ProposalEvent.delete);

    return t?.id ?? null;
  }

  async estimateFees(d: EstimateFeesDeps): Promise<EstimatedTransactionFees> {
    const account = asUAddress(d.account.address);
    const maxFeePerGas = await this.networks.get(account).estimatedMaxFeePerGas();

    return {
      id: `EstimatedTransactionFees:${d.id}`,
      maxNetworkEthFee: maxFeePerGas.mul(d.gasLimit.toString()),
      paymasterEthFees: {
        total: new Decimal(d.paymasterEthFees.total),
        activation: new Decimal(d.paymasterEthFees.activation),
      },
    };
  }
}
