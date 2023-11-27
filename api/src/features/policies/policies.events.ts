import { Injectable } from '@nestjs/common';
import { EventsProcessor, EventData } from '../events/events.processor';
import { ACCOUNT_ABI, PolicyKey, asHex, asPolicyKey, asUAddress } from 'lib';
import { Chain } from 'chains';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { and } from '../database/database.util';
import { selectPolicy } from './policies.util';
import { Log, decodeEventLog, getAbiItem } from 'viem';

@Injectable()
export class PoliciesEventsProcessor {
  constructor(
    private db: DatabaseService,
    private events: EventsProcessor,
  ) {
    this.events.on(getAbiItem({ abi: ACCOUNT_ABI, name: 'PolicyAdded' }), (data) =>
      this.policyAdded(data),
    );
    this.events.on(getAbiItem({ abi: ACCOUNT_ABI, name: 'PolicyRemoved' }), (data) =>
      this.policyRemoved(data),
    );
  }

  private async policyAdded({ chain, log }: EventData) {
    const r = decodeEventLog({ abi: ACCOUNT_ABI, ...log, eventName: 'PolicyAdded' });

    await this.markStateAsActive(chain, log, asPolicyKey(r[0]));
  }

  private async policyRemoved({ chain, log }: EventData) {
    const r = decodeEventLog({ abi: ACCOUNT_ABI, ...log, eventName: 'PolicyRemoved' });

    await this.markStateAsActive(chain, log, asPolicyKey(r[0]));
  }

  private async markStateAsActive(chain: Chain, log: Log, key: PolicyKey) {
    // It's possible that two policies are activated in the same proposal; it's not prohibited by a constraint.
    const policyState = e.assert_single(
      e.select(e.PolicyState, (ps) => ({
        filter: and(
          e.op(ps.policy, '=', selectPolicy({ account: asUAddress(log.address, chain), key })),
          e.op(
            ps.proposal,
            '=',
            e.select(e.Transaction, () => ({
              filter_single: { hash: asHex(log.transactionHash) },
              proposal: { id: true },
            })).proposal,
          ),
        ),
      })),
    );

    await e
      .update(policyState, () => ({
        set: {
          activationBlock: log.blockNumber,
        },
      }))
      .run(this.db.client);
  }
}
