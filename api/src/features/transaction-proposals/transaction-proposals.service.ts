import { Injectable } from '@nestjs/common';
import { UserInputError } from '@nestjs/apollo';
import {
  hashTx,
  isHex,
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
} from 'lib';
import { NetworksService } from '~/features/util/networks/networks.service';
import {
  ProposeTransactionInput,
  TransactionProposalsInput,
  UpdateTransactionProposalInput,
} from './transaction-proposals.input';
import { DatabaseService } from '../database/database.service';
import e, { $infer } from '~/edgeql-js';
import { Shape, ShapeFunc } from '../database/database.select';
import { and } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.util';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import { ApproveInput, ProposalEvent } from '../proposals/proposals.input';
import { PaymastersService } from '~/features/paymasters/paymasters.service';
import { EstimatedTransactionFees } from '~/features/transaction-proposals/transaction-proposals.model';
import Decimal from 'decimal.js';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { ExecutionsQueue } from '~/features/transaction-proposals/executions.worker';
import { FLOW_PRODUCER } from '../util/bull/bull.util';
import { QueueData, TypedQueue } from '~/features/util/bull/bull.util';
import { SimulationsQueue } from '~/features/simulations/simulations.worker';
import {
  proposalTxShape,
  transactionProposalAsTx,
} from '~/features/transaction-proposals/transaction-proposals.util';
import { hashTypedData } from 'viem';
import { v4 as uuid } from 'uuid';
import { FlowProducer } from 'bullmq';
import { ActivationsService } from '../activations/activations.service';
import { totalPaymasterEthFees } from '../paymasters/paymasters.util';

export const selectTransactionProposal = (
  id: UniqueProposal,
  shape?: ShapeFunc<typeof e.TransactionProposal>,
) =>
  e.select(e.TransactionProposal, (p) => ({
    ...shape?.(p),
    filter_single: { id },
  }));

export const estimateFeesDeps = {
  id: true,
  account: { address: true },
  gasLimit: true,
  maxPaymasterEthFees: {
    activation: true,
  },
} satisfies Shape<typeof e.TransactionProposal>;
const s_ = e.assert_exists(
  e.assert_single(e.select(e.TransactionProposal, () => estimateFeesDeps)),
);
export type EstimateFeesDeps = $infer<typeof s_>;

@Injectable()
export class TransactionProposalsService {
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

  async tryExecute(txProposal: UUID, ignoreSimulation?: boolean) {
    const updatedProposal = e.update(selectTransactionProposal(txProposal), () => ({
      set: { submitted: true },
    }));
    const account = asUAddress(
      (await this.db.query(e.select(updatedProposal.account.address))) ?? undefined,
    );
    if (!account) throw new Error(`Transaction proposal not found: ${txProposal}`);

    // simulate -> execute
    this.flows.add({
      queueName: ExecutionsQueue.name,
      name: 'Execute transaction',
      data: { txProposal, ignoreSimulation } satisfies QueueData<ExecutionsQueue>,
      children: [
        {
          queueName: SimulationsQueue.name,
          name: 'Simulate transaction',
          data: { txProposal } satisfies QueueData<SimulationsQueue>,
          children: [this.activations.activationFlow(account)],
        },
      ],
    });

    this.proposals.publishProposal({ id: txProposal, account }, ProposalEvent.submitted);
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

    gas ??=
      (
        await estimateTransactionOperationsGas({ account: asAddress(account), tx, network })
      ).unwrapOr(FALLBACK_OPERATIONS_GAS) + estimateTransactionVerificationGas(3);

    const id = asUUID(uuid());
    const insert = e.insert(e.TransactionProposal, {
      id,
      hash: hashTx(account, tx),
      account: selectAccount(account),
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
      this.simulations.add(SimulationsQueue.name, { txProposal: id });
      this.proposals.publishProposal({ id, account }, ProposalEvent.create);
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

  async approve(input: ApproveInput) {
    await this.proposals.approve(input);
    await this.tryExecute(input.id);
  }

  async update({ id, policy, feeToken }: UpdateTransactionProposalInput) {
    const updatedProposal = e.assert_single(
      e.update(e.TransactionProposal, (p) => ({
        filter: and(
          e.op(p.id, '=', e.uuid(id)),
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
          hash: true,
          account: { address: true },
          ...proposalTxShape(tx),
        }))
        .run(tx);
      if (!p) return;

      const hash = hashTypedData(
        asTypedData(asUAddress(p.account.address), transactionProposalAsTx(p)),
      );
      if (hash !== p.hash) {
        // Approvals are marked as invalid when the signed hash differs from the proposal hash
        await e
          .update(e.TransactionProposal, (proposal) => ({
            filter: e.op(proposal.id, '=', e.uuid(id)),
            set: { hash },
          }))
          .run(tx);
      }

      return { ...p, hash };
    });
    if (!p) return;

    if (policy !== undefined) await this.tryExecute(id);

    this.proposals.publishProposal(
      { id, account: asUAddress(p.account.address) },
      ProposalEvent.update,
    );

    return p;
  }

  async delete(id: UniqueProposal) {
    return this.db.transaction(async (db) => {
      // 1. Policies the proposal was going to create
      // Delete policies the proposal was going to activate
      const proposalPolicies = e.select(e.TransactionProposal, (p) => ({
        filter_single: { id },
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
