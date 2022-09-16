import { User } from '@gen/user/user.model';
import { Injectable } from '@nestjs/common';
import { Prisma, UserState } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { connectOrCreateDevice } from '~/util/connect-or-create';
import { UserConfigInput, UserIdInput } from './users.args';

const createWhereStateIsActive = (
  isActive: boolean,
): Prisma.UserStateWhereInput => ({
  OR: [
    {
      proposal: {
        submissions: {
          some: {
            response: isActive ? { isNot: null } : { is: null },
          },
        },
      },
    },
    {
      // Deploy user
      proposalHash: null,
      account: { isDeployed: isActive },
    },
  ],
});

const WHERE_STATE_IS_ACTIVE = createWhereStateIsActive(true);
const WHERE_STATE_IS_INACTIVE = createWhereStateIsActive(false);

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async latestState(
    user: User,
    isActive: boolean,
    args: Omit<Prisma.UserStateFindManyArgs, 'where'> = {},
  ): Promise<UserState | null> {
    const states = await this.prisma.user
      .findUniqueOrThrow({
        where: {
          accountId_deviceId: {
            accountId: user.accountId,
            deviceId: user.deviceId,
          },
        },
      })
      .states({
        orderBy: { createdAt: 'desc' },
        take: 1,
        ...args,
        where: isActive ? WHERE_STATE_IS_ACTIVE : WHERE_STATE_IS_INACTIVE,
      } as Prisma.UserStateFindManyArgs);

    return states[0] ?? null;
  }

  async isActive(user: UserIdInput) {
    return (
      (await this.prisma.user.count({
        where: {
          accountId: user.account,
          deviceId: user.device,
          states: { some: WHERE_STATE_IS_ACTIVE },
        },
      })) > 0
    );
  }

  getCreateUserState(
    configs: UserConfigInput[],
    proposalHash?: string,
  ): Prisma.UserStateUncheckedCreateNestedManyWithoutUserInput {
    return {
      create: {
        proposalHash,
        configs: {
          create: configs.map(
            (config): Prisma.UserConfigCreateWithoutStateInput => ({
              approvers: {
                create: config.approvers.map((approver) => ({
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
            }),
          ),
        },
      },
    };
  }
}
