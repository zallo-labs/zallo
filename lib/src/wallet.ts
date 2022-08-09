import { hexDataLength, hexlify, randomBytes } from 'ethers/lib/utils';
import { isEqual } from 'lodash';
import { Quorums } from './quorum';
import { Account } from './contracts';
import { Id, toId } from './id';
import { createTx, TxReq } from './tx';

export type WalletRef = string & { isWalletRef: true };
const WALLET_REF_BYTES = 4;

export const toWalletRef = (v: string): WalletRef => {
  if (hexDataLength(v) !== WALLET_REF_BYTES)
    throw new Error('Invalid wallet ref: ' + v);

  return v as WalletRef;
};

export const randomWalletRef = () =>
  hexlify(randomBytes(WALLET_REF_BYTES)) as WalletRef;

export interface Wallet {
  ref: WalletRef;
  quorums: Quorums;
}

export const getWalletId = (account: string, walletRef: WalletRef): Id =>
  toId(`${account}-${walletRef}`);

export const getApproverId = (
  account: string,
  walletRef: WalletRef,
  user: string,
) => toId(`${getWalletId(account, walletRef)}-${user}`);

export const createUpsertWalletTx = (account: Account, wallet: Wallet): TxReq =>
  createTx({
    to: account.address,
    data: account.interface.encodeFunctionData('upsertWallet', [
      wallet.ref,
      wallet.quorums,
    ]),
  });

export const createRemoveGroupTx = (account: Account, group: Wallet): TxReq =>
  createTx({
    to: account.address,
    data: account.interface.encodeFunctionData('removeWallet', [group.ref]),
  });

export const walletEquiv = (a: Wallet, b: Wallet): boolean =>
  isEqual(a.quorums, b.quorums);
