import { BytesLike } from 'ethers';
import { hexDataLength, hexDataSlice } from 'ethers/lib/utils';
import { address } from './addr';
import { Account, Account__factory } from './contracts';
import { User } from './user';
import { UserConfig } from './userConfig';
import { OnlyRequiredItems } from './util/mappedTypes';

export const getDataSighash = (data?: BytesLike) =>
  data && hexDataLength(data) >= 4 ? hexDataSlice(data, 0, 4) : undefined;

export const ACCOUNT_INTERFACE = Account__factory.createInterface();

export const UPSERT_USER_FUNCTION =
  ACCOUNT_INTERFACE.functions['upsertUser((address,(address[])[]))'];
export const UPSERT_WALLET_SIGHSAH =
  ACCOUNT_INTERFACE.getSighash(UPSERT_USER_FUNCTION);

export const REMOVE_USER_FUNCTION =
  ACCOUNT_INTERFACE.functions['removeUser(address)'];
export const REMOVE_WALLET_SIGHASH =
  ACCOUNT_INTERFACE.getSighash(REMOVE_USER_FUNCTION);

type UpsertWalletParams = OnlyRequiredItems<Parameters<Account['upsertUser']>>;

export const tryDecodeUpsertUserData = async (
  data?: BytesLike,
): Promise<User | undefined> => {
  const sighash = getDataSighash(data);
  if (!data || sighash !== UPSERT_WALLET_SIGHSAH) return undefined;

  try {
    const [u] = ACCOUNT_INTERFACE.decodeFunctionData(
      UPSERT_USER_FUNCTION,
      data,
    ) as UpsertWalletParams;

    return {
      addr: address(await u.addr),
      configs: await Promise.all(
        u.configs.map(
          async (c): Promise<UserConfig> => ({
            approvers: await Promise.all(
              c.approvers.map(async (a) => address(await a)),
            ),
            spendingAllowlisted: false,
            limits: {},
          }),
        ),
      ),
    };
  } catch {
    return undefined;
  }
};

type RemoveWalletParams = OnlyRequiredItems<Parameters<Account['removeUser']>>;

export const tryDecodeRemoveWalletData = (data?: BytesLike) => {
  const sighash = getDataSighash(data);
  if (!data || sighash !== REMOVE_WALLET_SIGHASH) return undefined;

  try {
    const [user] = ACCOUNT_INTERFACE.decodeFunctionData(
      REMOVE_USER_FUNCTION,
      data,
    ) as RemoveWalletParams;

    return { addr: address(user) };
  } catch {
    return undefined;
  }
};
