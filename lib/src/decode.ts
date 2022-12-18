import { BytesLike } from 'ethers';
import { hexDataLength, hexDataSlice, hexlify } from 'ethers/lib/utils';
import { Account, Account__factory } from './contracts';
import { QuorumKey, toQuorumKey } from './quorum';
import { OnlyRequiredItems } from './util/mappedTypes';

export const getDataSighash = (data?: BytesLike) =>
  data && hexDataLength(data) >= 4 ? hexDataSlice(data, 0, 4) : undefined;

export const ACCOUNT_INTERFACE = Account__factory.createInterface();

export const UPSERT_QUORUM_FUNCTION = ACCOUNT_INTERFACE.functions['upsertQuorum(uint32,bytes32)'];
export const UPSERT_QUORUM_SIGHSAH = ACCOUNT_INTERFACE.getSighash(UPSERT_QUORUM_FUNCTION);

export const REMOVE_QUORUM_FUNCTION = ACCOUNT_INTERFACE.functions['removeQuorum(uint32)'];
export const REMOVE_QUORUM_SIGHASH = ACCOUNT_INTERFACE.getSighash(REMOVE_QUORUM_FUNCTION);

type UpsertQuorumParams = OnlyRequiredItems<Parameters<Account['upsertQuorum']>>;

export const tryDecodeUpsertUserQuorum = (data?: BytesLike) => {
  if (!data || getDataSighash(data) !== UPSERT_QUORUM_SIGHSAH) return undefined;

  try {
    const [key, hash] = ACCOUNT_INTERFACE.decodeFunctionData(
      UPSERT_QUORUM_FUNCTION,
      data,
    ) as UpsertQuorumParams;

    return {
      key: toQuorumKey(key),
      hash: hexlify(hash),
    };
  } catch {
    return undefined;
  }
};

export const tryDecodeRemoveUserData = (data?: BytesLike): QuorumKey | undefined => {
  if (!data || getDataSighash(data) !== REMOVE_QUORUM_SIGHASH) return undefined;

  try {
    const [key] = ACCOUNT_INTERFACE.decodeFunctionData(
      REMOVE_QUORUM_FUNCTION,
      data,
    ) as OnlyRequiredItems<Parameters<Account['removeQuorum']>>;

    return toQuorumKey(key);
  } catch {
    return undefined;
  }
};
