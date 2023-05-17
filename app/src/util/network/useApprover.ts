import { PROVIDER } from '~/util/network/provider';
import { Address, Approver } from 'lib';
import { persistedAtom } from '../persistedAtom';
import { useAtomValue, useSetAtom } from 'jotai';

const DANGEROUS_approverAtom = persistedAtom<Approver, string>(
  'Approver',
  Approver.createRandom().connect(PROVIDER),
  {
    stringifiy: (approver) => approver.privateKey,
    parse: (privateKey) => new Approver(privateKey, PROVIDER),
    secure: {},
  },
);

// TODO: rename to useApproverWallet
export const useApprover = () => useAtomValue(DANGEROUS_approverAtom);

// TODO: rename to useApprover
export const useApproverId = () => useApprover().address as Address;

export const useSetApproverFromMnemonic = () => {
  const setApprover = useSetAtom(DANGEROUS_approverAtom);

  return (mnemonic: string) => setApprover(Approver.fromMnemonic(mnemonic).connect(PROVIDER));
};
