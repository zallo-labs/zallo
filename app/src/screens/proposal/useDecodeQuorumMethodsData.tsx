import { BytesLike } from 'ethers';
import { Address, tryDecodeRemoveQuorumData, tryDecodeUpsertQuorumData } from 'lib';
import { useQuorum } from '~/queries/quroum/useQuorum.api';

export const useDecodeQuorumMethodsData = (account: Address, data?: BytesLike) => {
  const upsert = tryDecodeUpsertQuorumData(data);
  const removeKey = !upsert && tryDecodeRemoveQuorumData(data);

  const quorum = useQuorum(
    upsert ? { account, key: upsert.key } : removeKey ? { account, key: removeKey } : undefined,
  );

  return !quorum
    ? undefined
    : upsert
    ? ({ ...quorum, stateHash: upsert.hash, method: 'upsert' } as const)
    : ({ ...quorum, method: 'remove' } as const);
};
