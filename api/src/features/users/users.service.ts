import { Injectable } from '@nestjs/common';
import { Prisma, UserState } from '@prisma/client';
import { UserId } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { connectOrCreateDevice } from '~/util/connect-or-create';
import { UserConfigInput } from './users.args';

const createWhereStateIsActive = (isActive: boolean): Prisma.UserStateWhereInput => ({
  OR: [
    {
      proposal: {
        transactions: {
          [isActive ? 'some' : 'none']: {
            response: {
              success: true,
            },
          },
        },
      },
    },
    {
      // Deploy user
      proposalId: null,
      account: { isActive },
    },
  ],
});

const WHERE_STATE_IS_ACTIVE = createWhereStateIsActive(true);
const WHERE_STATE_IS_INACTIVE = createWhereStateIsActive(false);

export const WHERE_STATE_IS_DISABLED: Prisma.UserStateWhereInput = {
  isDeleted: true,
  proposal: {
    transactions: {
      some: {
        response: { success: true },
      },
    },
  },
};

export const WHERE_STATE_IS_ENABLED: Prisma.UserStateWhereInput = {
  NOT: WHERE_STATE_IS_DISABLED,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  latestStateArgs(user: UserId, isActive: boolean | null) {
    return {
      where: {
        accountId: user.account,
        deviceId: user.addr,
        ...(isActive !== null && isActive ? WHERE_STATE_IS_ACTIVE : WHERE_STATE_IS_INACTIVE),
      },
      orderBy: { createdAt: 'desc' },
    } as const;
  }

  async latestState(
    user: UserId,
    isActive: boolean,
    args: Omit<Prisma.UserStateFindManyArgs, 'where'> = {},
  ): Promise<UserState | null> {
    const states = await this.prisma.user
      .findUniqueOrThrow({
        where: {
          accountId_deviceId: {
            accountId: user.account,
            deviceId: user.addr,
          },
        },
      })
      .states({
        ...args,
        orderBy: { createdAt: 'desc' },
        take: 1,
        where: isActive ? WHERE_STATE_IS_ACTIVE : WHERE_STATE_IS_INACTIVE,
      } as Prisma.UserStateFindManyArgs);

    return states[0] ?? null;
  }

  async isActive(user: UserId) {
    return !!(await this.latestState(user, true));
  }

  createUserConfigs(
    configs: UserConfigInput[],
  ): Prisma.UserConfigCreateNestedManyWithoutStateInput {
    return {
      create: configs.map((config) => ({
        approvers: {
          create: [...config.approvers].map((approver) => ({
            device: connectOrCreateDevice(approver),
          })),
        },
        spendingAllowlisted: config.spendingAllowlisted,
        limits: {
          create: config.limits.map((limit) => ({
            token: limit.token,
            amount: limit.amount.toString(),
            period: limit.period,
          })),
        },
      })),
    };
  }
}
