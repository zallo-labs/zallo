import { PROVIDER } from '~/util/network/provider';
import { atom, useRecoilValue } from 'recoil';
import { getSecureStore, persistAtom } from '~/util/effect/persistAtom';
import { Address, Approver } from 'lib';

export const approverAtom = atom<Approver>({
  key: 'approver',
  default: Approver.createRandom().connect(PROVIDER),
  effects: [
    persistAtom({
      stringify: (approver) => approver.privateKey,
      parse: (privateKey) => new Approver(privateKey, PROVIDER),
      storage: getSecureStore(),
    }),
  ],
  dangerouslyAllowMutability: true, // Required due to provider internal mutations
});

export const useApprover = () => useRecoilValue(approverAtom);

export const useApproverId = () => useApprover().address as Address;
