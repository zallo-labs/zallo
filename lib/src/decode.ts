import { BytesLike } from 'ethers';
import { hexDataLength, hexDataSlice, hexlify } from 'ethers/lib/utils';
import { Account, Account__factory } from './contracts';
import { OnlyRequiredItems } from './util/mappedTypes';
import { toWalletRef } from './wallet';

export const getDataSighash = (data?: BytesLike) =>
  data && hexDataLength(data) >= 4 ? hexDataSlice(data, 0, 4) : undefined;

export const ACCOUNT_INTERFACE = Account__factory.createInterface();

export const UPSERT_WALLET_FUNCTION =
  ACCOUNT_INTERFACE.functions['upsertWallet(bytes4,address[][])'];
export const UPSERT_WALLET_SIGHSAH = ACCOUNT_INTERFACE.getSighash(
  UPSERT_WALLET_FUNCTION,
);

export const REMOVE_WALLET_FUNCTION =
  ACCOUNT_INTERFACE.functions['removeWallet(bytes4)'];
export const REMOVE_WALLET_SIGHASH = ACCOUNT_INTERFACE.getSighash(
  REMOVE_WALLET_FUNCTION,
);

type UpsertWalletParams = OnlyRequiredItems<
  Parameters<Account['upsertWallet']>
>;

export const tryDecodeUpsertWalletData = (data?: BytesLike) => {
  const sighash = getDataSighash(data);
  if (!data || sighash !== UPSERT_WALLET_SIGHSAH) return undefined;

  try {
    const [ref] = ACCOUNT_INTERFACE.decodeFunctionData(
      UPSERT_WALLET_FUNCTION,
      data,
    ) as UpsertWalletParams;

    return { ref: toWalletRef(hexlify(ref)) };
  } catch {
    return undefined;
  }
};

type RemoveWalletParams = OnlyRequiredItems<
  Parameters<Account['removeWallet']>
>;

export const tryDecodeRemoveWalletData = (data?: BytesLike) => {
  const sighash = getDataSighash(data);
  if (!data || sighash !== REMOVE_WALLET_SIGHASH) return undefined;

  try {
    const [ref] = ACCOUNT_INTERFACE.decodeFunctionData(
      REMOVE_WALLET_FUNCTION,
      data,
    ) as RemoveWalletParams;

    return { ref: toWalletRef(hexlify(ref)) };
  } catch {
    return undefined;
  }
};
