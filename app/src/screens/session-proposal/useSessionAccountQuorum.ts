import { Address, QuorumGuid, QuorumKey } from 'lib';
import {
  atom,
  atomFamily,
  DefaultValue,
  selectorFamily,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { useQuorum } from '~/queries/useQuorum.api';
import { persistAtom } from '~/util/effect/persistAtom';

/*
 * WalletConnect only provides the account on a session request
 * so we need to store the quorum key for each account in a session
 */

type WcSessionId = number;
export type SessionAccountQuorum = Record<Address, QuorumKey>;

const SESSION_IDS = atom<WcSessionId[]>({
  key: 'sessionIds',
  default: [],
  effects: [persistAtom()],
});

const SESSION_ACCOUNT_QUORUMS_STATE = atomFamily<SessionAccountQuorum, WcSessionId>({
  key: 'sessionAccountQuorumsState',
  default: {},
  effects: [persistAtom()],
});

export const SESSION_ACCOUNT_QUORUMS = selectorFamily<SessionAccountQuorum, WcSessionId>({
  key: 'sessionAccountQuorums',
  get:
    (addr) =>
    ({ get }) =>
      get(SESSION_ACCOUNT_QUORUMS_STATE(addr)),
  set:
    (addr) =>
    ({ set, reset }, token) => {
      if (token instanceof DefaultValue) {
        reset(SESSION_IDS);
        reset(SESSION_ACCOUNT_QUORUMS_STATE(addr));
      } else {
        set(SESSION_IDS, (prev) => (prev.includes(addr) ? prev : [...prev, addr]));
        set(SESSION_ACCOUNT_QUORUMS_STATE(addr), token);
      }
    },
});

export const useSessonAccountQuorum = (session: WcSessionId, account: Address) => {
  const key = useRecoilValue(SESSION_ACCOUNT_QUORUMS(session))[account];
  return useQuorum(key ? { account, key } : undefined);
};

export const useSessionAccountQuorumsState = (session: WcSessionId) =>
  useRecoilState(SESSION_ACCOUNT_QUORUMS(session));

export const useSessionKeys = () => useRecoilValue(SESSION_IDS);
