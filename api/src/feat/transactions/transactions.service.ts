import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UserInputError } from '@nestjs/apollo';
import {
  hashTx,
  Tx,
  asAddress,
  asUAddress,
  asChain,
  ETH_ADDRESS,
  asTypedData,
  asUUID,
  UUID,
  ACCOUNT_ABI,
  asHex,
  Hex,
  encodeOperations,
  encodePaymasterInput,
  UAddress,
  Address,
} from 'lib';
import { NetworkFeeParams, NetworksService } from '~/core/networks';
import {
  PrepareTransactionInput,
  ProposeCancelScheduledTransactionInput,
  ProposeTransactionInput,
  UpdateTransactionInput,
} from './transactions.input';
import { DatabaseService } from '~/core/database';
import e from '~/edgeql-js';
import { ShapeFunc } from '~/core/database';
import { and } from '~/core/database';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import { ApproveInput, ProposalEvent } from '../proposals/proposals.input';
import { PaymastersService } from '~/feat/paymasters/paymasters.service';
import {
  EstimatedFeeParts,
  EstimatedTransactionFees,
} from '~/feat/transactions/transactions.model';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { ExecutionsQueue } from '~/feat/transactions/executions.worker';
import { FLOW_PRODUCER, QueueData } from '~/core/bull/bull.util';
import { SimulationsQueue } from '~/feat/simulations/simulations.worker';
import {
  TX_SHAPE,
  selectTransaction2,
  transactionAsTx,
} from '~/feat/transactions/transactions.util';
import { encodeFunctionData, EstimateGasErrorType, hashTypedData } from 'viem';
import { FlowProducer } from 'bullmq';
import { ActivationsService } from '../activations/activations.service';
import { ConfirmationQueue } from '../system-txs/confirmations.queue';
import { PoliciesService } from '../policies/policies.service';
import { TokensService } from '~/feat/tokens/tokens.service';
import { PricesService } from '~/feat/prices/prices.service';
import { lowerOfPaymasterFees, totalPaymasterEthFees } from '~/feat/paymasters/paymasters.util';
import Decimal from 'decimal.js';
import { afterRequest } from '~/core/context';
import { DEFAULT_FLOW } from '~/core/bull/bull.module';
import { insertTransaction } from './insert-transaction.query';
import { deleteTransaction } from './delete-transaction.query';
import { fromPromise } from 'neverthrow';
import _ from 'lodash';
import { PaymasterFeeParts } from '../paymasters/paymasters.model';
import { utils as zkUtils } from 'zksync-ethers';
import { EstimateFeeParameters } from 'viem/zksync';
import { ChainConfig } from 'chains';

type EstimateEip712FeeParams = Extract<
  EstimateFeeParameters<ChainConfig>,
  { type?: 'eip712' | 'priority' | null | undefined }
>;
type EstimateNetworkFeeParams = Omit<EstimateEip712FeeParams, 'type' | 'account'> & {
  account: UAddress;
  feeToken: Address;
} & (
    | { paymaster: Address; paymasterInput: Hex }
    | { paymaster?: undefined; paymasterInput?: undefined }
  );

interface EstimateFeesParams {
  account: UAddress;
  feeToken: Address;
  gasLimit: bigint;
  paymasterEthFees: PaymasterFeeParts;
}

const GAS_LIMIT_MULTIPLIER = 2n; // Future gas estimate may increase
const FEE_TOKEN_PRICE_MULTIPLIER = new Decimal('2'); // Future fee token price may reduce

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
    return this.db.queryWith2({ id: e.uuid }, { id }, ({ id }) =>
      e.select(e.Transaction, (t) => ({
        ...shape?.(t),
        filter_single: { id },
      })),
    );
  }

  async tryExecute(transaction: UUID, ignoreSimulation?: boolean) {
    const t = await this.db.queryWith2({ id: e.uuid }, { id: transaction }, ({ id }) =>
      e.select(e.Transaction, () => ({
        filter_single: { id },
        account: { address: true, active: true },
      })),
    );
    if (!t) throw new Error(`Transaction proposal not found: ${transaction}`);

    const account = asUAddress(t.account.address);
    const chain = asChain(account);

    // simulate -> (activate -> activation-receipt)? -> execute -> receipt
    this.flows.add(
      {
        queueName: ConfirmationQueue.name,
        name: 'Transaction',
        data: { chain, transaction: { child: 0 } } satisfies QueueData<ConfirmationQueue>,
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
      DEFAULT_FLOW,
    );
  }

  private async prepare({
    account,
    operations,
    timestamp = new Date(),
    gas: gasInput,
    feeToken = ETH_ADDRESS,
    policy,
  }: PrepareTransactionInput) {
    if (!operations.length) throw new UserInputError('No operations provided');

    const chain = asChain(account);
    const network = this.networks.get(chain);
    const paymaster = this.paymasters.for(chain);

    const [gasEstimate, maxFeePerGas, paymasterFees, feeTokenPrice] = await Promise.all([
      (async () =>
        gasInput ??
        (await this.estimateNetworkFees({ account, feeToken, ...encodeOperations(operations) }))
          .gasLimit)(),
      network.maxFeePerGas(),
      this.paymasters.paymasterFees({ account }),
      this.prices.price(asUAddress(feeToken, chain)),
    ]);
    const gasLimit = gasEstimate * GAS_LIMIT_MULTIPLIER;
    const maxNetworkFee = maxFeePerGas.mul(gasLimit.toString());
    const totalEthFees = maxNetworkFee.plus(totalPaymasterEthFees(paymasterFees));
    const maxAmount = totalEthFees.div(feeTokenPrice.eth).mul(FEE_TOKEN_PRICE_MULTIPLIER);

    const tx = {
      operations,
      timestamp: BigInt(Math.floor(timestamp.getTime() / 1000)),
      gas: gasLimit,
      feeToken,
      paymaster,
      maxAmount: await this.tokens.asFp(asUAddress(feeToken, chain), maxAmount),
    } satisfies Tx;
    const hash = hashTx(account, tx);

    const { policyKey, policyId, validationErrors } = await this.policies.best(account, tx);
    policy ??= policyKey;

    return {
      tx,
      hash,
      paymasterFees,
      maxNetworkFee,
      maxAmount,
      policy,
      policyId,
      validationErrors,
    };
  }

  async prepareTransaction(
    {
      account,
      operations,
      timestamp = new Date(),
      gas: gasInput,
      feeToken = ETH_ADDRESS,
      policy: policyInput,
    }: PrepareTransactionInput,
    shape?: ShapeFunc,
  ) {
    const { tx, hash, policy, paymasterFees, maxNetworkFee } = await this.prepare({
      account,
      operations,
      timestamp,
      gas: gasInput,
      feeToken,
      policy: policyInput,
    });

    const r = shape?.includes?.('feeToken')
      ? await this.db.queryWith(
          { feeToken: e.UAddress },
          ({ feeToken }) =>
            e.select({
              feeToken: shape?.includes?.('feeToken')
                ? e.select(e.token(feeToken), (t) => ({
                    ...shape?.(t, 'feeToken'),
                  }))
                : e.cast(e.Token, e.set()),
            }),
          { feeToken: asUAddress(feeToken, asChain(account)) },
        )
      : undefined;

    return {
      id: `PreparedTransaction:${hash}`,
      hash,
      timestamp,
      gasLimit: tx.gas,
      feeToken: r?.feeToken,
      maxAmount: tx.maxAmount,
      paymaster: tx.paymaster,
      paymasterEthFees: {
        total: totalPaymasterEthFees(paymasterFees),
        activation: paymasterFees.activation,
      },
      account,
      policy,
      maxNetworkFee,
    };
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
    policy,
  }: ProposeTransactionInput) {
    const chain = asChain(account);
    const { tx, hash, paymasterFees, maxAmount, policyId, validationErrors } = await this.prepare({
      account,
      operations,
      timestamp,
      gas: gasInput,
      feeToken,
      policy,
    });

    const r = await this.db.exec(insertTransaction, {
      hash,
      account,
      policy: policyId,
      validationErrors, // TODO: handle at result level
      label,
      icon,
      timestamp,
      dapp,
      operations,
      gasLimit: tx.gas,
      feeToken: asUAddress(feeToken, chain),
      maxAmount: maxAmount.toString(),
      paymaster: tx.paymaster,
      activationFee: paymasterFees.activation.toString(),
    });
    const id = asUUID(r.id);

    if (signature) {
      await this.approve({ id, signature }, true);
    } else {
      afterRequest(() => this.tryExecute(id));
    }

    this.proposals.event({ id, account }, ProposalEvent.create);
    this.proposals.notifyApprovers(id);

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
    const t = await this.db.query(
      e.assert_single(
        e.select(e.Transaction, (t) => ({
          filter: and(
            e.op(t.id, '=', e.uuid(id)),
            e.op(t.status, 'in', e.set(e.TransactionStatus.Pending, e.TransactionStatus.Failed)),
          ),
          hash: true,
          account: { address: true },
          paymasterEthFees: { total: true },
          maxAmount: true,
          ...TX_SHAPE,
        })),
      ),
    );
    if (!t) return;

    const account = asUAddress(t.account.address);

    let maxAmount = new Decimal(t.maxAmount);
    if (feeToken) {
      const network = this.networks.get(account);
      const [maxFeePerGas, feeTokenPrice] = await Promise.all([
        network.maxFeePerGas(),
        this.prices.price(asUAddress(feeToken, network.chain.key)),
      ]);
      const newTotalEthFee = maxFeePerGas.mul(t.gasLimit.toString()).plus(t.paymasterEthFees.total);
      maxAmount = newTotalEthFee.div(feeTokenPrice.eth).mul(FEE_TOKEN_PRICE_MULTIPLIER);
    }

    const uFeeToken = asUAddress(feeToken ?? asAddress(t.feeToken.address), asChain(account));
    const tx: Tx = {
      ...transactionAsTx(t),
      feeToken,
      maxAmount: await this.tokens.asFp(uFeeToken, maxAmount),
    };

    const hash = hashTypedData(asTypedData(account, tx));
    const newHash = hash !== t.hash ? hash : undefined;
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

    this.proposals.event({ id, account: t.account }, ProposalEvent.update);

    return { id };
  }

  async delete(id: UniqueProposal) {
    const { transaction: t } = await this.db.exec(deleteTransaction, { transaction: id });

    this.proposals.event(t, ProposalEvent.delete);

    return t?.id ?? null;
  }

  async estimateNetworkFees({ account, feeToken, ...estimateParams }: EstimateNetworkFeeParams) {
    const chain = asChain(account);
    const network = this.networks.get(chain);
    const paymaster = this.paymasters.for(chain);
    const isActive = !!(await network.getCode({ address: asAddress(account) }))?.length;

    const estimate = await fromPromise(
      network.estimateFee({
        type: 'eip712',
        account: asAddress(account),
        // Only active accounts can estimate paymaster fees. Inactive accounts use EOA account code and throw 'Unsupported paymaster flow'
        ...(isActive
          ? {
              paymaster,
              paymasterInput: encodePaymasterInput({ token: feeToken, amount: 0n, maxAmount: 0n }),
            }
          : { paymaster: undefined, paymasterInput: undefined }),
        ...estimateParams,
      }),
      (e) => e as EstimateGasErrorType,
    );

    return {
      gasLimit: estimate.map((e) => e.gasLimit).unwrapOr(2_000_000n),
      ...(await network.feeParams()),
    };
  }

  async fees({
    account,
    feeToken,
    paymasterEthFees: proposedPaymasterEthFees,
    gasLimit,
  }: EstimateFeesParams): Promise<Omit<EstimatedTransactionFees, 'id'>> {
    const [feeParams, feeTokenPrice, curPaymasterFees] = await Promise.all([
      this.networks.get(account).feeParams(),
      this.prices.price(asUAddress(feeToken, asChain(account))),
      this.paymasters.paymasterFees({ account }),
    ]);

    const networkFee = feeParams.maxFeePerGas.mul(gasLimit.toString());
    const lowerPaymasterEthFeeParts = lowerOfPaymasterFees(
      { activation: new Decimal(proposedPaymasterEthFees.activation) },
      curPaymasterFees,
    );
    const paymasterFees = {
      total: totalPaymasterEthFees(lowerPaymasterEthFeeParts),
      ...lowerPaymasterEthFeeParts,
    };

    const eth: EstimatedFeeParts = {
      networkFee,
      paymasterFees,
      maxFeePerGas: feeParams.maxFeePerGas,
      maxPriorityFeePerGas: feeParams.maxPriorityFeePerGas,
      total: networkFee.add(paymasterFees.total),
    };

    return {
      eth,
      feeToken: {
        ..._.mapValues(_.omit(eth, 'paymasterFees'), (v) => v.div(feeTokenPrice.eth)),
        paymasterFees: _.mapValues(paymasterFees, (v) => v.div(feeTokenPrice.eth)),
      },
      gasLimit,
      gasPerPubdataLimit: feeParams.gasPerPubdataLimit,
    };
  }
}
