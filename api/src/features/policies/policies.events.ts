import { Injectable } from '@nestjs/common';
import { EventsWorker, EventData, Log } from '../events/events.worker';
import { ACCOUNT_ABI, PolicyKey, asPolicyKey, asUAddress } from 'lib';
import { Chain } from 'chains';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { and, or } from '../database/database.util';
import { getAbiItem } from 'viem';
import { selectAccount } from '../accounts/accounts.util';

const policyAddedEvent = getAbiItem({ abi: ACCOUNT_ABI, name: 'PolicyAdded' });
const policyRemovedEvent = getAbiItem({ abi: ACCOUNT_ABI, name: 'PolicyRemoved' });

@Injectable()
export class PoliciesEventsProcessor {
  constructor(
    private db: DatabaseService,
    private events: EventsWorker,
  ) {
    this.events.on(policyAddedEvent, (data) => this.policyAdded(data));
    this.events.on(policyRemovedEvent, (data) => this.policyRemoved(data));
  }

  private async policyAdded({ chain, log }: EventData<typeof policyAddedEvent>) {
    await this.markStateAsActive(chain, log, asPolicyKey(log.args.key));
  }

  private async policyRemoved({ chain, log }: EventData<typeof policyRemovedEvent>) {
    await this.markStateAsActive(chain, log, asPolicyKey(log.args.key));
  }

  private async markStateAsActive(chain: Chain, log: Log, key: PolicyKey) {
    // TODO: filter state by state hash (part of event log) to ensure correct state is activated
    // It's possible that two policies are activated in the same proposal; it's not prohibited by a constraint.
    const proposal = e.select(e.SystemTx, () => ({
      filter_single: { hash: log.transactionHash },
    })).proposal;

    await this.db.query(
      e.update(e.PolicyState, (ps) => ({
        filter: and(
          e.op(ps.account, '=', selectAccount(asUAddress(log.address, chain))),
          e.op(ps.key, '=', key),
          or(e.op(ps.proposal, '?=', proposal), ps.initState),
        ),
        set: {
          activationBlock: log.blockNumber,
        },
      })),
    );
  }
}
