import { asAddress, asHex, asUAddress, asUUID } from 'lib';
import { UserContext } from '#/util/context';
import { randomBytes } from 'crypto';
import { v4 as uuid, v4 } from 'uuid';

export const randomHex = (nBytes: number) => asHex('0x' + randomBytes(nBytes).toString('hex'));

export const randomAddress = () => asAddress(randomHex(20));

export const randomUAddress = () => asUAddress(randomAddress(), 'zksync-local');

export const randomHash = () => asHex(randomHex(32));

export const randomLabel = () => `label-${randomHex(19)}`; 

export const randomUser = (): UserContext => ({
  id: asUUID(uuid()),
  approver: randomAddress(),
  accounts: [],
});

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
