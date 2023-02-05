import { Wallet } from 'ethers';
import { address } from 'lib';
import { PrismaPromise } from '@prisma/client';
import { UserContext } from '~/request/ctx';

export const randomAddress = () => address(Wallet.createRandom().address);

export const asPrismaPromise = <V>(v: V) => v as PrismaPromise<Awaited<V>>;

export const randomUser = (): UserContext => ({
  id: randomAddress(),
  accounts: new Set([randomAddress()]),
});
