import { Account } from '@gen/account/account.model';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  address,
  Address,
  deployAccountProxy,
  TokenLimit,
  TokenLimitPeriod,
  toDeploySalt,
  toQuorumKey,
} from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { ProviderService } from '~/provider/provider.service';
import { BigNumber } from 'ethers';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService, private provider: ProviderService) {}

  async accounts(device: Address, args: Prisma.AccountFindManyArgs = {}): Promise<Account[]> {
    return this.prisma.account.findMany({
      ...args,
      where: {
        AND: [
          {
            quorumStates: {
              some: {
                approvers: { some: { deviceId: device } },
                isRemoved: false,
              },
            },
          },
          args.where ?? {},
        ],
      },
    });
  }

  async activateAccount(accountAddr: Address) {
    const { impl, deploySalt, isActive, quorumStates } =
      await this.prisma.account.findUniqueOrThrow({
        where: { id: accountAddr },
        select: {
          impl: true,
          deploySalt: true,
          isActive: true,
          // Initialization quorums
          quorumStates: {
            where: { proposal: null },
            include: {
              approvers: true,
              limits: true,
            },
          },
        },
      });
    if (isActive) return;

    // Activate
    const r = await this.provider.useProxyFactory((factory) =>
      deployAccountProxy(
        {
          impl: address(impl),
          quorums: quorumStates.map((q) => ({
            key: toQuorumKey(q.quorumKey),
            approvers: new Set(q.approvers.map((a) => address(a.deviceId))),
            spending: {
              allowlisted: q.spendingAllowlisted,
              limits: Object.fromEntries(
                q.limits.map((l): [Address, TokenLimit] => [
                  address(l.token),
                  {
                    token: address(l.token),
                    amount: BigNumber.from(l.amount),
                    period: l.period as TokenLimitPeriod,
                  },
                ]),
              ),
            },
          })),
        },
        factory,
        toDeploySalt(deploySalt),
      ),
    );
    await r.account.deployed();

    await this.prisma.account.update({
      where: { id: accountAddr },
      data: { isActive: true },
    });
  }
}
