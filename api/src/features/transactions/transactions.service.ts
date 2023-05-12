import { InjectQueue } from '@nestjs/bull';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import {
  asAddress,
  executeTx,
  asHex,
  mapAsync,
  isPresent,
  Tx,
  Address,
  Hex,
  getTransactionSatisfiability,
  Policy,
  PolicySatisfiability,
  isHex,
} from 'lib';
import { ProviderService } from '~/features/util/provider/provider.service';
import {
  ProposalsService,
  selectProposal,
  selectTransactionProposal,
  UniqueProposal,
} from '../proposals/proposals.service';
import { TransactionEvent, TRANSACTIONS_QUEUE } from './transactions.queue';
import { policyStateAsPolicy, policyStateShape } from '../policies/policies.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import _ from 'lodash';
import { ProposalEvent } from '../proposals/proposals.args';
import { selectUser } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    private db: DatabaseService,
    private provider: ProviderService,
    @InjectQueue(TRANSACTIONS_QUEUE.name)
    private transactionsQueue: Queue<TransactionEvent>,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
  ) {}

  async tryExecute(id: UniqueProposal) {
    const policy = await this.firstSatisfiedPolicy(id);
    if (!policy) return undefined;

    const proposal = await this.db.query(
      e.select(e.TransactionProposal, () => ({
        filter_single: isHex(id) ? { hash: id } : { id },
        account: { address: true },
        hash: true,
        to: true,
        value: true,
        data: true,
        nonce: true,
        gasLimit: true,
        approvals: {
          user: { address: true },
          signature: true,
        },
      })),
    );
    if (!proposal) throw new Error(`Proposal ${id} not found`);

    const approvals = (
      await mapAsync(proposal.approvals, (a) =>
        this.provider.asApproval({
          digest: proposal.hash as Hex,
          approver: a.user.address as Address,
          signature: a.signature as Hex,
        }),
      )
    ).filter(isPresent);

    if (approvals.length !== proposal.approvals.length) {
      // TODO: remove invalid approvals
      const toRemove = proposal.approvals
        .map((a) => a.user.address as Address)
        .filter((a) => !approvals.find((approval) => approval.approver === a));

      await e
        .for(e.set(...toRemove.map((approver) => selectUser(approver))), (user) =>
          e.delete(e.Approval, () => ({ filter_single: { proposal: selectProposal(id), user } })),
        )
        .run(this.db.client);

      // Proposal may still be executable under a different path
      return this.tryExecute(id);
    }

    const transaction = await executeTx({
      account: this.provider.connectAccount(asAddress(proposal.account.address as Address)),
      tx: {
        to: proposal.to as Address,
        value: proposal.value ?? undefined,
        data: (proposal.data ?? undefined) as Hex | undefined,
        nonce: proposal.nonce,
        gasLimit: proposal.gasLimit,
      },
      policy,
      approvals,
    });

    const transactionHash = asHex(transaction.hash);
    await e
      .insert(e.Transaction, {
        hash: transactionHash,
        proposal: selectTransactionProposal(id),
        gasPrice: transaction.gasPrice?.toNumber() ?? 0,
      })
      .run(this.db.client);

    await this.proposals.publishProposal(
      { hash: proposal.hash, account: (proposal.account as any).address as Address },
      ProposalEvent.submitted,
    );

    this.transactionsQueue.add({ transaction: transactionHash }, { delay: 2000 /* 2s */ });

    return transactionHash;
  }

  async satisfiablePolicies(id: UniqueProposal) {
    const proposal = await this.db.query(
      selectTransactionProposal(id, () => ({
        to: true,
        value: true,
        data: true,
        nonce: true,
        gasLimit: true,
        approvals: {
          user: { address: true },
        },
        account: {
          policies: {
            key: true,
            state: policyStateShape,
          },
        },
      })),
    );
    if (!proposal) throw new Error(`Proposal ${id} not found`);

    const tx: Tx = {
      to: proposal.to as Address,
      value: proposal.value ?? undefined,
      data: (proposal.data ?? undefined) as Hex | undefined,
      nonce: proposal.nonce,
    };

    const approvals = new Set(proposal.approvals.map((a) => a.user.address as Address));

    const policies = ((proposal.account as any).policies as any[]).map((policy) => {
      const p = policyStateAsPolicy(policy.key, policy.state);
      return { policy: p, satisfiability: getTransactionSatisfiability(p, tx, approvals) };
    });

    return { policies, approvals };
  }

  async firstSatisfiedPolicy(id: UniqueProposal): Promise<Policy | undefined> {
    return (await this.satisfiablePolicies(id)).policies.find(
      ({ satisfiability }) => satisfiability === PolicySatisfiability.Satisfied,
    )?.policy;
  }
}
