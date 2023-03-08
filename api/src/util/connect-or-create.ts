import { Prisma } from '@prisma/client';
import { Address, PolicyGuid, PolicyKey } from 'lib';
import { getUserId } from '~/request/ctx';

export const connectAccount = (
  id: Address,
): Prisma.AccountCreateNestedOneWithoutProposalsInput => ({
  connect: { id },
});

export const connectUser = (id: Address): Prisma.UserCreateNestedOneWithoutApprovalsInput => ({
  connectOrCreate: {
    where: { id },
    create: { id },
  },
});

export const connectOrCreateUser = (
  id: Address = getUserId(),
): Prisma.UserCreateNestedOneWithoutApprovalsInput => ({
  connectOrCreate: {
    where: { id },
    create: { id },
  },
});

export const connectPolicy = (...params: [PolicyGuid] | [Address, PolicyKey]) =>
  ({
    connect: {
      accountId_key: {
        accountId: params.length === 1 ? params[0].account : params[0],
        key: params.length === 1 ? params[0].key : params[1],
      },
    },
  } satisfies Prisma.PolicyCreateNestedManyWithoutAccountInput);
