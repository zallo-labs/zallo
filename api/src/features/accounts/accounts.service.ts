import { Account } from '@gen/account/account.model';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Address } from 'lib';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  public async accounts(
    device: Address,
    args: Omit<Prisma.AccountFindManyArgs, 'where'> = {},
  ): Promise<Account[]> {
    return this.prisma.account.findMany({
      ...args,
      where: {
        users: {
          some: { deviceId: device },
        },
      },
    });
  }
}
