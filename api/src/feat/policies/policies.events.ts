import { Injectable } from '@nestjs/common';
import { EventsWorker, EventData, Log } from '../events/events.worker';
import { ACCOUNT_ABI, PolicyKey, asPolicyKey, asUAddress } from 'lib';
import { Chain } from 'chains';
import { DatabaseService } from '~/core/database';
import { getAbiItem } from 'viem';
import { activatePolicy } from './activate-policy.query';

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
    await this.db.exec(activatePolicy, {
      account: asUAddress(log.address, chain),
      key,
      systxHash: log.transactionHash,
      activationBlock: log.blockNumber,
    });
  }
}
