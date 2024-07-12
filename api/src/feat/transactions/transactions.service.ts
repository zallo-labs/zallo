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
import { NetworksService } from '~/core/networks';
import {
  ProposeCancelScheduledTransactionInput,
  ProposeTransactionInput,
  UpdateTransactionInput,
} from './transactions.input';
import { DatabaseService } from '~/core/database';
import e, { $infer } from '~/edgeql-js';
import { Shape, ShapeFunc } from '~/core/database';
import { and } from '~/core/database';
import { selectAccount } from '../accounts/accounts.util';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import { ApproveInput, ProposalEvent } from '../proposals/proposals.input';
import { PaymastersService } from '~/feat/paymasters/paymasters.service';
import { EstimatedTransactionFees } from '~/feat/transactions/transactions.model';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { ExecutionsQueue } from '~/feat/transactions/executions.worker';
import { FLOW_PRODUCER, QueueData } from '~/core/bull/bull.util';
import { SimulationsQueue } from '~/feat/simulations/simulations.worker';
import {
  TX_SHAPE,
  selectTransaction2,
  transactionAsTx,
} from '~/feat/transactions/transactions.util';
import { encodeFunctionData, hashTypedData } from 'viem';
import { FlowProducer } from 'bullmq';
import { ActivationsService } from '../activations/activations.service';
import { ReceiptsQueue } from '../system-txs/receipts.queue';
import { PoliciesService } from '../policies/policies.service';
import { TokensService } from '~/feat/tokens/tokens.service';
import { PricesService } from '~/feat/prices/prices.service';
import { lowerOfPaymasterFees, totalPaymasterEthFees } from '~/feat/paymasters/paymasters.util';
import Decimal from 'decimal.js';
import { afterRequest } from '~/core/context';
import { DEFAULT_FLOW } from '~/core/bull/bull.module';
import { PaymasterFeeParts } from '~/feat/paymasters/paymasters.model';
import { insertTransaction } from './insert-transaction.query';
import { deleteTransaction } from './delete-transaction.query';

const MAX_NETWORK_FEE_MULTIPLIER = new Decimal(5); // Allow for a higher network fee

export const estimateFeesDeps = {
  id: true,
  account: { address: true },
  gasLimit: true,
  paymasterEthFees: {
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

  async tryExecute(transaction: UUID | Hex, ignoreSimulation?: boolean) {
    const t = isHex(transaction)
      ? await this.db.queryWith2({ hash: e.Bytes32 }, { hash: transaction }, ({ hash }) =>
          e.select(e.Transaction, () => ({
            filter_single: { hash },
            id: true,
            account: { address: true, active: true },
          })),
        )
      : await this.db.queryWith2({ id: e.uuid }, { id: transaction }, ({ id }) =>
          e.select(e.Transaction, () => ({
            filter_single: { id },
            id: true,
            account: { address: true, active: true },
          })),
        );
    if (!t) throw new Error(`Transaction proposal not found: ${transaction}`);

    const id = asUUID(t.id);
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
              transaction: id,
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
              : [this.activations.flow(account, id) /* Includes simulation */],
          },
        ],
      },
      DEFAULT_FLOW,
    );
  }

  async getInsertProposal({
    account,
    operations,
    label,
    icon,
    dapp,
    timestamp = new Date(),
    gas: gasInput,
    feeToken = ETH_ADDRESS,
  }: Omit<ProposeTransactionInput, 'signature'>) {
    if (!operations.length) throw new UserInputError('No operations provided');

    const chain = asChain(account);
    const network = this.networks.get(chain);
    const getGas = async () =>
      (gasInput ??=
        (
          await estimateTransactionOperationsGas({
            account: asAddress(account),
            network,
            operations,
          })
        ).unwrapOr(FALLBACK_OPERATIONS_GAS) + estimateTransactionVerificationGas(3));

    const [gas, maxFeePerGas, paymasterFees, feeTokenPrice] = await Promise.all([
      getGas(),
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
    const hash = hashTx(account, tx);
    const { policy, validationErrors } = await this.policies.best(account, tx);

    // Ordering operation ids ensures
    // TODO: ensure operations are retrieved in the same order as they were inserted
    const insertOperation = e.for(
      e.set(
        ...operations.map((op, i) =>
          e.json({
            to: op.to,
            value: op.value,
            data: op.data,
            position: i,
          }),
        ),
      ),
      (op) =>
        e.insert(e.Operation, {
          to: e.cast(e.Address, op.to),
          value: e.cast(e.uint256, e.cast(e.str, e.json_get(op, 'value'))),
          data: e.cast(e.Bytes, e.json_get(op, 'data')),
          position: e.cast(e.int32, op.position),
        }),
    );

    const insert = e.insert(e.Transaction, {
      hash,
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
      unorderedOperations: insertOperation,
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

    afterRequest(() => this.tryExecute(hash));

    return insert;
  }

  async propose({
    account,
    operations,
    label,
    icon,
    timestamp = new Date(),
    dapp,
    gas: gasInput,
    feeToken = ETH_ADDRESS,
    signature,
  }: ProposeTransactionInput) {
    if (!operations.length) throw new UserInputError('No operations provided');

    const chain = asChain(account);
    const network = this.networks.get(chain);
    const getGas = async () =>
      (gasInput ??=
        (
          await estimateTransactionOperationsGas({
            account: asAddress(account),
            network,
            operations,
          })
        ).unwrapOr(FALLBACK_OPERATIONS_GAS) + estimateTransactionVerificationGas(3));

    const [gas, maxFeePerGas, paymasterFees, feeTokenPrice] = await Promise.all([
      getGas(),
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
    const hash = hashTx(account, tx);
    const { policyId, validationErrors } = await this.policies.best(account, tx);

    const r = await this.db.exec(insertTransaction, {
      hash,
      account,
      policy: policyId,
      validationErrors,
      label,
      icon,
      timestamp,
      dapp,
      operations,
      gasLimit: gas,
      feeToken: asUAddress(feeToken, chain),
      maxAmount: maxAmount.toString(),
      paymaster: tx.paymaster,
      activationFee: paymasterFees.activation.toString(),
    });
    const id = asUUID(r.id);

    this.proposals.event({ id, account }, ProposalEvent.create);
    if (signature) {
      await this.approve({ id, signature }, true);
    } else {
      afterRequest(() => this.tryExecute(id));
    }

    return id;
  }

  async proposeCancelScheduledTransaction({
    proposal,
    ...params
  }: ProposeCancelScheduledTransactionInput) {
    const hash = await this.db.queryWith2({ id: e.uuid }, { id: proposal }, ({ id }) =>
      e.select(selectTransaction2(id).hash),
    );
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

  async approve(input: ApproveInput, tryExecute = true) {
    await this.proposals.approve(input);
    if (tryExecute) this.tryExecute(input.id);
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

    const hash = hashTypedData(asTypedData(account, tx));
    const newHash = hash !== p.hash ? hash : undefined;
    await this.db.query(
      e.update(e.Transaction, (p) => ({
        filter_single: { id },
        set: {
          hash: newHash,
          ...(policy && { policy: e.latestPolicy(p.account, policy) }),
          ...(feeToken && {
            hash,
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

    if (newHash || policy !== undefined) await this.tryExecute(id);

    this.proposals.event({ id, account: p.account }, ProposalEvent.update);

    return { id };
  }

  async delete(id: UniqueProposal) {
    const { transaction: t } = await this.db.exec(deleteTransaction, { transaction: id });

    this.proposals.event(t, ProposalEvent.delete);

    return t?.id ?? null;
  }

  async estimateFees(d: EstimateFeesDeps): Promise<EstimatedTransactionFees> {
    const account = asUAddress(d.account.address);
    const [maxFeePerGas, curPaymasterFees] = await Promise.all([
      this.networks.get(account).estimatedMaxFeePerGas(),
      this.paymasters.paymasterFees({ account }),
    ]);

    const existingPaymasterFees: PaymasterFeeParts = {
      activation: new Decimal(d.paymasterEthFees.activation),
    };
    const estPaymasterFees = lowerOfPaymasterFees(existingPaymasterFees, curPaymasterFees);

    return {
      id: `EstimatedTransactionFees:${d.id}`,
      maxNetworkEthFee: maxFeePerGas.mul(d.gasLimit.toString()),
      paymasterEthFees: { total: totalPaymasterEthFees(estPaymasterFees), ...estPaymasterFees },
    };
  }
}
