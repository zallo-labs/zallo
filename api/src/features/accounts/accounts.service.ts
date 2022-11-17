import { Account } from '@gen/account/account.model';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { address, Address, deployAccountProxy, Limit, LimitPeriod, toDeploySalt } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { ProviderService } from '~/provider/provider.service';
import assert from 'assert';
import { BigNumber } from 'ethers';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService, private provider: ProviderService) {}

  async deviceAccounts(
    device: Address,
    args: Omit<Prisma.AccountFindManyArgs, 'where'> = {},
  ): Promise<Account[]> {
    return this.prisma.account.findMany({
      ...args,
      where: {
        users: {
          some: {
            deviceId: device,
            latestState: {
              isDeleted: false,
            },
          },
        },
      },
    });
  }

  async activateAccount(accountAddr: Address) {
    const { isDeployed, impl, deploySalt, userStates } =
      await this.prisma.account.findUniqueOrThrow({
        where: { id: accountAddr },
        select: {
          isDeployed: true,
          impl: true,
          deploySalt: true,
          userStates: {
            where: { proposal: null },
            select: {
              deviceId: true,
              configs: {
                select: {
                  approvers: true,
                  spendingAllowlisted: true,
                  limits: true,
                },
              },
            },
          },
        },
      });
    if (isDeployed) return;

    assert(userStates.length === 1);
    const userState = userStates[0];

    // Activate
    const r = await deployAccountProxy(
      {
        impl: address(impl),
        user: {
          addr: address(userState.deviceId!),
          configs: userState.configs.map((c) => ({
            approvers: c.approvers.map((a) => address(a.deviceId)),
            spendingAllowlisted: c.spendingAllowlisted,
            limits: Object.fromEntries(
              c.limits.map((l) => {
                const token = address(l.token);
                const limit: Limit = {
                  token,
                  amount: BigNumber.from(l.amount),
                  period: l.period as LimitPeriod,
                };

                return [token, limit] as const;
              }),
            ),
          })),
        },
      },
      this.provider.proxyFactory,
      toDeploySalt(deploySalt),
    );
    await r.account.deployed();

    await this.prisma.account.update({
      where: { id: accountAddr },
      data: { isDeployed: true },
    });
  }
}
