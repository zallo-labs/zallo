import { hexDataLength, hexlify, randomBytes } from 'ethers/lib/utils';
import { isEqual } from 'lodash';
import { Quorums } from './quorum';
import { Safe } from './contracts';
import { Id, toId } from './id';
import { createTx, TxReq } from './tx';

export type AccountRef = string & { isAccountRef: true };
const ACCOUNT_REF_BYTES = 4;

export const toAccountRef = (v: string): AccountRef => {
  if (hexDataLength(v) !== ACCOUNT_REF_BYTES)
    throw new Error('Invalid account ref: ' + v);

  return v as AccountRef;
};

export const randomAccountRef = () =>
  hexlify(randomBytes(ACCOUNT_REF_BYTES)) as AccountRef;

export interface Account {
  ref: AccountRef;
  quorums: Quorums;
}

export const getAccountId = (safe: string, accountRef: AccountRef): Id =>
  toId(`${safe}-${accountRef}`);

export const getApproverId = (
  safe: string,
  accountRef: AccountRef,
  user: string,
) => toId(`${getAccountId(safe, accountRef)}-${user}`);

export const createUpsertAccountTx = (safe: Safe, account: Account): TxReq =>
  createTx({
    to: safe.address,
    data: safe.interface.encodeFunctionData('upsertAccount', [
      account.ref,
      account.quorums,
    ]),
  });

export const createRemoveGroupTx = (safe: Safe, group: Account): TxReq =>
  createTx({
    to: safe.address,
    data: safe.interface.encodeFunctionData('removeAccount', [group.ref]),
  });

export const accountEquiv = (a: Account, b: Account): boolean =>
  isEqual(a.quorums, b.quorums);
