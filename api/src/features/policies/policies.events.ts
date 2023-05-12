import { Injectable } from '@nestjs/common';
import { EventsProcessor, ListenerData } from '../events/events.processor';
import { ACCOUNT_INTERFACE, PolicyKey, asAddress, asHex, asPolicyKey } from 'lib';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { and } from '../database/database.util';
import { selectPolicy } from './policies.service';
import { Log } from '@ethersproject/abstract-provider';

@Injectable()
export class PoliciesEventsProcessor {
  constructor(private db: DatabaseService, private events: EventsProcessor) {
    this.events.on(
      ACCOUNT_INTERFACE.getEventTopic(ACCOUNT_INTERFACE.events['PolicyAdded(uint32,bytes32)']),
      this.policyAdded,
    );
    this.events.on(
      ACCOUNT_INTERFACE.getEventTopic(ACCOUNT_INTERFACE.events['PolicyRemoved(uint32)']),
      this.policyRemoved,
    );
  }

  private async policyAdded({ log }: ListenerData) {
    const r = ACCOUNT_INTERFACE.decodeEventLog(
      ACCOUNT_INTERFACE.events['PolicyAdded(uint32,bytes32)'],
      log.data,
      log.topics,
    );

    await this.markStateAsActive(log, asPolicyKey(r[0]));
  }

  private async policyRemoved({ log }: ListenerData) {
    const r = ACCOUNT_INTERFACE.decodeEventLog(
      ACCOUNT_INTERFACE.events['PolicyRemoved(uint32)'],
      log.data,
      log.topics,
    );

    await this.markStateAsActive(log, asPolicyKey(r[0]));
  }

  private async markStateAsActive(log: Log, key: PolicyKey) {
    // It's possible that two policies are activated in the same proposal; it's not prohibited by a constraint.
    const policyState = e.assert_single(
      e.select(e.PolicyState, (ps) => ({
        filter: and(
          e.op(ps.policy, '=', selectPolicy({ account: asAddress(log.address), key })),
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
          activationBlock: BigInt(log.blockNumber),
        },
      }))
      .run(this.db.client);
  }
}
