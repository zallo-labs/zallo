import { Injectable } from '@nestjs/common';
import { EventsWorker, EventData, Log } from '../events/events.worker';
import { ACCOUNT_ABI, PolicyKey, asHex, asPolicyKey, asUAddress } from 'lib';
import { Chain } from 'chains';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { and } from '../database/database.util';
import { selectPolicy } from './policies.util';
import { getAbiItem } from 'viem';

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
    await this.db.query(
      e.update(e.PolicyState, (ps) => ({
        filter: and(
          e.op(ps.policy, '=', selectPolicy({ account: asUAddress(log.address, chain), key })),
          e.op(
            e.op(
              ps.proposal,
              '?=', // Returns {false} rather than {} if one doesn't exist
              e.select(e.SystemTx, () => ({
                filter_single: { hash: asHex(log.transactionHash!) },
                proposal: { id: true },
              })).proposal,
            ),
            'or',
            ps.isAccountInitState,
          ),
        ),
        set: {
          activationBlock: log.blockNumber,
        },
      })),
    );
  }
}
