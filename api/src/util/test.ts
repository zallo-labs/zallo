import { asAddress, asHex } from 'lib';
import { UserContext } from '~/request/ctx';
import { randomBytes } from 'crypto';

export const randomHex = (nBytes: number) => asHex('0x' + randomBytes(nBytes).toString('hex'));

export const randomAddress = () => asAddress(randomHex(20));

export const randomHash = () => asHex(randomHex(32));

export const randomUser = (): UserContext => ({ address: randomAddress(), accounts: [] });
