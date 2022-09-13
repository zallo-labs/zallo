import { Prisma } from '@prisma/client';
import { Address } from 'lib';

export const connectOrCreateAccount = (
  account: Address,
): Prisma.AccountCreateNestedOneWithoutUsersInput => ({
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

export const connectOrCreateUser = (
  account: Address,
  device: Address,
  name: string,
): Prisma.UserCreateNestedOneWithoutStatesInput => ({
  connectOrCreate: {
    where: {
      accountId_deviceId: {
        accountId: account,
        deviceId: device,
      },
    },
    create: {
      account: connectOrCreateAccount(account),
      device: connectOrCreateDevice(device),
      name,
    },
  },
});
