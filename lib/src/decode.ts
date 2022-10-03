import { BytesLike } from 'ethers';
import { hexDataLength, hexDataSlice } from 'ethers/lib/utils';
import { address } from './addr';
import { Account, Account__factory } from './contracts';
import { UserStructOutput } from './contracts/Account';
import { User } from './user';
import { UserConfig } from './userConfig';
import { OnlyRequiredItems } from './util/mappedTypes';

export const getDataSighash = (data?: BytesLike) =>
  data && hexDataLength(data) >= 4 ? hexDataSlice(data, 0, 4) : undefined;

export const ACCOUNT_INTERFACE = Account__factory.createInterface();

export const UPSERT_USER_FUNCTION =
  ACCOUNT_INTERFACE.functions['upsertUser((address,(address[])[]))'];
export const UPSERT_USER_SIGHSAH =
  ACCOUNT_INTERFACE.getSighash(UPSERT_USER_FUNCTION);

export const REMOVE_USER_FUNCTION =
  ACCOUNT_INTERFACE.functions['removeUser(address)'];
export const REMOVE_USER_SIGHASH =
  ACCOUNT_INTERFACE.getSighash(REMOVE_USER_FUNCTION);

export const tryDecodeUpsertUserData = (data?: BytesLike): User | undefined => {
  const sighash = getDataSighash(data);
  if (!data || sighash !== UPSERT_USER_SIGHSAH) return undefined;

  try {
    const [addr, configs] = ACCOUNT_INTERFACE.decodeFunctionData(
      UPSERT_USER_FUNCTION,
      data,
    )[0] as UserStructOutput;

    return {
      addr: address(addr),
      configs: configs.map(
        ([approvers]): UserConfig => ({
          approvers: approvers.map(address),
          spendingAllowlisted: false,
          limits: {},
        }),
      ),
    };
  } catch {
    return undefined;
  }
};

type RemoveUserParams = OnlyRequiredItems<Parameters<Account['removeUser']>>;

export const tryDecodeRemoveUserData = (data?: BytesLike) => {
  const sighash = getDataSighash(data);
  if (!data || sighash !== REMOVE_USER_SIGHASH) return undefined;

  try {
    const [user] = ACCOUNT_INTERFACE.decodeFunctionData(
      REMOVE_USER_FUNCTION,
      data,
    ) as RemoveUserParams;

    return { addr: address(user) };
  } catch {
    return undefined;
  }
};
