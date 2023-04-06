import { Prisma } from '@prisma/client';
import { Address, Addresslike, asAddress, PolicyId, PolicyKey } from 'lib';
import { getUserId } from '~/request/ctx';

export const connectAccount = (
  id: Addresslike,
): Prisma.AccountCreateNestedOneWithoutProposalsInput => ({
  connect: { id: asAddress(id) },
});

export const connectOrCreateUser = (user?: Addresslike) => {
  const id = user ? asAddress(user) : getUserId();

  return {
    connectOrCreate: {
      where: { id },
      create: { id },
    },
  } satisfies Prisma.UserCreateNestedOneWithoutApprovalsInput;
};

export const connectPolicy = (...params: [PolicyId] | [Address, PolicyKey]) =>
  ({
    connect: {
      accountId_key: {
        accountId: params.length === 1 ? params[0].account : params[0],
        key: params.length === 1 ? params[0].key : params[1],
      },
    },
  } satisfies Prisma.PolicyCreateNestedManyWithoutAccountInput);
