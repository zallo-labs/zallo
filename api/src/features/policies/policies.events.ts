import { Injectable } from '@nestjs/common';
import { PrismaService } from '../util/prisma/prisma.service';
import { EventsProcessor, ListenerData } from '../events/events.processor';
import { ACCOUNT_INTERFACE, Address, Hex, PolicyKey, asAddress, asHex, asPolicyKey } from 'lib';

@Injectable()
export class PoliciesEventsProcessor {
  constructor(private events: EventsProcessor, private prisma: PrismaService) {
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

    await this.markStateAsActive(
      asAddress(log.address),
      asPolicyKey(r[0]),
      asHex(log.transactionHash),
    );
  }

  private async policyRemoved({ log }: ListenerData) {
    const r = ACCOUNT_INTERFACE.decodeEventLog(
      ACCOUNT_INTERFACE.events['PolicyRemoved(uint32)'],
      log.data,
      log.topics,
    );

    await this.markStateAsActive(
      asAddress(log.address),
      asPolicyKey(r[0]),
      asHex(log.transactionHash),
    );
  }

  private async markStateAsActive(accountId: Address, key: PolicyKey, transactionHash: Hex) {
    const proposalId = (
      await this.prisma.asSystem.transaction.findUniqueOrThrow({
        where: { hash: transactionHash },
        select: { proposalId: true },
      })
    ).proposalId;

    const state = await this.prisma.asSystem.policyState.findUniqueOrThrow({
      where: {
        accountId_policyKey_proposalId: { accountId, policyKey: key, proposalId },
      },
      select: {
        id: true,
        policy: { select: { draftId: true } },
      },
    });

    await this.prisma.asSystem.policy.update({
      where: { accountId_key: { accountId, key } },
      data: {
        activeId: state.id,
        ...(state.policy.draftId === state.id && { draftId: null }),
      },
    });
  }
}
