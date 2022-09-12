import { Prisma } from '@prisma/client';
import { Address, WalletRef } from 'lib';

export const connectOrCreateAccount = (
  account: Address,
): Prisma.AccountCreateNestedOneWithoutWalletsInput => ({
  connectOrCreate: {
    where: { id: account },
    create: { id: account },
  },
});

export const connectOrCreateDevice = (
  device: Address,
): Prisma.DeviceCreateNestedOneWithoutApprovalsInput => ({
  connectOrCreate: {
    where: { id: device },
    create: { id: device },
  },
});

export const connectOrCreateWallet = (
  account: Address,
  ref: WalletRef,
): Prisma.WalletCreateNestedOneWithoutTxsInput => ({
  connectOrCreate: {
    where: {
      accountId_ref: {
        accountId: account,
        ref,
      },
    },
    create: {
      account: connectOrCreateAccount(account),
      ref,
    },
  },
});
