import { Prisma } from '@prisma/client';
import { Address } from 'lib';

export const connectOrCreateSafe = (
  safe: Address,
): Prisma.SafeCreateNestedOneWithoutAccountsInput => ({
  connectOrCreate: {
    where: { id: safe },
    create: { id: safe },
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
