import { PROVIDER } from '~/util/network/provider';
import { atom, useRecoilValue } from 'recoil';
import { getSecureStore, persistAtom } from '~/util/effect/persistAtom';
import { Approver } from 'lib';

export const APPROVER = atom<Approver>({
  key: 'approver',
  default: Approver.createRandom().connect(PROVIDER),
  effects: [
    persistAtom({
      save: (approver) => approver.privateKey,
      load: (privateKey) => new Approver(privateKey, PROVIDER),
      storage: getSecureStore(),
    }),
  ],
  dangerouslyAllowMutability: true, // Required due to provider internal mutations
});

export const useApprover = () => useRecoilValue(APPROVER);
