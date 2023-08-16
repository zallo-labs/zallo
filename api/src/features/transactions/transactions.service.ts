import { InjectQueue } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import {
  executeTx,
  asHex,
  mapAsync,
  isPresent,
  Tx,
  Address,
  Hex,
  getTransactionSatisfiability,
  isHex,
  tryOrCatchAsync,
  estimateTransactionTotalGas,
} from 'lib';
import { ProviderService } from '~/features/util/provider/provider.service';
import { selectTransactionProposal } from '../transaction-proposals/transaction-proposals.service';
import { TransactionEvent, TRANSACTIONS_QUEUE } from './transactions.queue';
import {
  policyStateAsPolicy,
  PolicyStateShape,
  policyStateShape,
  selectPolicy,
} from '../policies/policies.util';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import _ from 'lodash';
import { ShapeFunc } from '../database/database.select';
import { UserInputError } from '@nestjs/apollo';
import { PaymasterService } from '../paymaster/paymaster.service';
import {
  proposalTxShape,
  transactionProposalAsTx,
} from '../transaction-proposals/transaction-proposals.uitl';
import { selectApprover } from '../approvers/approvers.service';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.input';

@Injectable()
export class TransactionsService {
  constructor(
    private db: DatabaseService,
    private provider: ProviderService,
    @InjectQueue(TRANSACTIONS_QUEUE.name)
    private transactionsQueue: Queue<TransactionEvent>,
    // @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
    private paymaster: PaymasterService,
  ) {}

  async selectUnique(txHash: Hex, shape?: ShapeFunc<typeof e.Transaction>) {
    return this.db.query(
      e.select(e.Transaction, (t) => ({
        filter_single: { hash: txHash },
        ...shape?.(t),
      })),
    );
  }

  async tryExecute(uniqueProposal: UniqueProposal) {
    const proposal = await this.db.query(
      e.select(e.TransactionProposal, (p) => ({
        filter_single: isHex(uniqueProposal) ? { hash: uniqueProposal } : { id: uniqueProposal },
        id: true,
        account: {
          address: true,
          policies: {
            key: true,
            state: policyStateShape,
          },
        },
        hash: true,
        ...proposalTxShape(p),
        feeToken: { address: true },
        approvals: {
          approver: { address: true },
          signature: true,
        },
        policy: {
          key: true,
          state: policyStateShape,
        },
        status: true,
      })),
    );
    if (!proposal) throw new UserInputError(`Proposal ${uniqueProposal} not found`);
    if (proposal.status !== 'Pending' && proposal.status !== 'Failed')
      throw new UserInputError(`Proposal ${uniqueProposal} must be pending or failed to execute`);

    const approvals = (
      await mapAsync(proposal.approvals, (a) =>
        this.provider.asApproval({
          digest: proposal.hash as Hex,
          approver: a.approver.address as Address,
          signature: a.signature as Hex,
        }),
      )
    ).filter(isPresent);

    if (approvals.length !== proposal.approvals.length) {
      const expiredApprovals = proposal.approvals
        .map((a) => a.approver.address as Address)
        .filter((a) => !approvals.find((approval) => approval.approver === a));

      // TODO: Mark approvals as expired rather than removing
      await e
        .for(e.set(...expiredApprovals.map((approver) => selectApprover(approver))), (approver) =>
          e.delete(e.Approval, () => ({
            filter_single: { proposal: selectTransactionProposal(proposal.id), approver },
          })),
        )
        .run(this.db.DANGEROUS_superuserClient);

      return this.tryExecute(proposal.id);
    }

    const tx = {
      ...transactionProposalAsTx(proposal),
      gasLimit: estimateTransactionTotalGas(proposal.gasLimit, approvals.length),
    };

    const policy = await this.getExecutionPolicy(
      tx,
      new Set(approvals.map((a) => a.approver)),
      proposal.policy,
      proposal.account.policies,
    );
    if (!policy) return undefined;

    const gasPrice = (await this.provider.getGasPrice()).toBigInt();

    const transaction = await tryOrCatchAsync(
      async () =>
        await executeTx({
          account: this.provider.connectAccount(proposal.account.address as Address),
          tx,
          policy,
          approvals,
          gasPrice,
          customData: {
            paymasterParams: await this.paymaster.getPaymasterParams({
              feeToken: proposal.feeToken.address as Address,
              gasLimit: tx.gasLimit,
              gasPrice,
            }),
          },
        }),
      (e) => {
        throw new Error(`Failed to execute transaction: ${e}`);
      },
    );

    const transactionHash = asHex(transaction.hash);
    await e
      .insert(e.Transaction, {
        hash: transactionHash,
        proposal: selectTransactionProposal(proposal.id),
        gasPrice,
      })
      .run(this.db.client);

    // Set executing policy if none was set
    if (!proposal.policy?.state) {
      await e
        .update(e.TransactionProposal, () => ({
          filter_single: { id: proposal.id },
          set: {
            policy: selectPolicy({ account: proposal.account.address as Address, key: policy.key }),
          },
        }))
        .run(this.db.client);
    }

    await this.proposals.publishProposal(
      { hash: proposal.hash as Hex, account: proposal.account.address as Address },
      ProposalEvent.submitted,
    );

    await this.transactionsQueue.add({ transaction: transactionHash }, { delay: 2000 /* 2s */ });

    return transactionHash;
  }

  async satisfiablePolicies(id: UniqueProposal) {
    const proposal = await this.db.query(
      e.select(e.TransactionProposal, (p) => ({
        filter_single: isHex(id) ? { hash: id } : { id },
        ...proposalTxShape(p),
        approvals: {
          approver: { address: true },
        },
        rejections: {
          approver: { address: true },
        },
        account: {
          id: true,
          policies: {
            key: true,
            state: policyStateShape,
          },
        },
      })),
    );
    if (!proposal) throw new Error(`Proposal ${id} not found`);

    const tx = transactionProposalAsTx(proposal);

    const approvals = new Set(proposal.approvals.map((a) => a.approver.address as Address));
    const rejections = new Set(proposal.rejections.map((a) => a.approver.address as Address));

    const policies = proposal.account.policies
      .map((policy) => policyStateAsPolicy(policy.key, policy.state))
      .filter(isPresent)
      .map((policy) => ({
        policy,
        satisfiability: getTransactionSatisfiability(policy, tx, approvals),
      }));

    return { accountId: proposal.account.id, policies, approvals, rejections };
  }

  private async getExecutionPolicy(
    tx: Tx,
    approvals: Set<Address>,
    proposalPolicy: { key: number; state: PolicyStateShape } | null,
    accountPolicies: { key: number; state: PolicyStateShape }[],
  ) {
    if (proposalPolicy) {
      // Only execute with proposal policy if specified
      const p = policyStateAsPolicy(proposalPolicy.key, proposalPolicy.state);
      if (p && getTransactionSatisfiability(p, tx, approvals).result === 'satisfied') return p;
    } else {
      return accountPolicies
        .map((policy) => policyStateAsPolicy(policy.key, policy.state))
        .find(
          (policy) =>
            policy && getTransactionSatisfiability(policy, tx, approvals).result === 'satisfied',
        );
    }
  }
}
