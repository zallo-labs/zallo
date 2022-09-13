import { User } from '@gen/user/user.model';
import { Injectable } from '@nestjs/common';
import { Prisma, UserState } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { connectOrCreateDevice } from '~/util/connect-or-create';
import { UserConfigInput } from './users.args';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  public async latestState(
    user: User,
    args: Prisma.UserStateFindManyArgs,
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
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        ...args,
      } as Prisma.UserStateFindManyArgs);

    return states[0] ?? null;
  }

  public getCreateUserState(
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
