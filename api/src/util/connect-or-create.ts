import { Prisma } from '@prisma/client';
import { Address } from 'lib';

export const connectOrCreateAccount = (
  account: Address,
): Prisma.AccountCreateNestedOneWithoutWalletsInput => ({
  connectOrCreate: {
    where: { id: account },
    create: { id: account },
  },
});

export const connectOrCreateUser = (
  addr: Address,
): Prisma.UserCreateNestedOneWithoutApprovalsInput => ({
  connectOrCreate: {
    where: { id: addr },
    create: { id: addr },
  },
});
