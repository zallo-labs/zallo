import { BigNumberish, BytesLike } from 'ethers';
import { hexDataLength, hexDataSlice } from 'ethers/lib/utils';
import { address } from './addr';
import { Account, Account__factory } from './contracts';
import { QuorumDefStructOutput, QuorumStructOutput } from './contracts/Account';
import { Quorum, QuorumId, toQuorumId } from './quorum';
import { OnlyRequiredItems } from './util/mappedTypes';

export const getDataSighash = (data?: BytesLike) =>
  data && hexDataLength(data) >= 4 ? hexDataSlice(data, 0, 4) : undefined;

export const ACCOUNT_INTERFACE = Account__factory.createInterface();

export const UPSERT_QUORUM_FUNCTION =
  ACCOUNT_INTERFACE.functions['upsertQuorum(uint32,(address[]))'];
export const UPSERT_QUORUM_SIGHSAH = ACCOUNT_INTERFACE.getSighash(UPSERT_QUORUM_FUNCTION);

export const REMOVE_QUORUM_FUNCTION = ACCOUNT_INTERFACE.functions['removeQuorum(uint32)'];
export const REMOVE_QUORUM_SIGHASH = ACCOUNT_INTERFACE.getSighash(REMOVE_QUORUM_FUNCTION);

type UpsertQuorumParams = [BigNumberish, QuorumStructOutput]; // OnlyRequiredItems<Parameters<Account['upsertQuorum']>>;

export const tryDecodeUpsertUserQuorum = (data?: BytesLike): Quorum | undefined => {
  if (!data || getDataSighash(data) !== UPSERT_QUORUM_SIGHSAH) return undefined;

  try {
    const [id, q] = ACCOUNT_INTERFACE.decodeFunctionData(
      UPSERT_QUORUM_FUNCTION,
      data,
    ) as UpsertQuorumParams;

    return {
      id: toQuorumId(id),
      approvers: q.approvers.map(address),
      limits: {},
      spendingAllowlisted: false,
    };
  } catch {
    return undefined;
  }
};

export const tryDecodeRemoveUserData = (data?: BytesLike): QuorumId | undefined => {
  if (!data || getDataSighash(data) !== REMOVE_QUORUM_SIGHASH) return undefined;

  try {
    const [id] = ACCOUNT_INTERFACE.decodeFunctionData(
      REMOVE_QUORUM_FUNCTION,
      data,
    ) as OnlyRequiredItems<Parameters<Account['removeQuorum']>>;

    return toQuorumId(id);
  } catch {
    return undefined;
  }
};
