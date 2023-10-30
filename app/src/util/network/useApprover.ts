import { PROVIDER } from '~/util/network/provider';
import { Address, Approver } from 'lib';
import { persistedAtom } from '~/lib/persistedAtom';
import { useAtomValue, useSetAtom } from 'jotai';
import { secureJsonStorage } from '~/lib/secure-storage/json';

export const DANGEROUS_approverAtom = persistedAtom<Approver, string>(
  'Approver',
  () => Approver.createRandom().connect(PROVIDER),
  {
    stringifiy: (approver) => approver.privateKey,
    parse: (privateKey) => new Approver(privateKey, PROVIDER),
    storage: secureJsonStorage(),
  },
);

export const useApproverWallet = () => useAtomValue(DANGEROUS_approverAtom);

export const useApproverAddress = () => useApproverWallet().address as Address;

export const useSetApproverFromMnemonic = () => {
  const setApprover = useSetAtom(DANGEROUS_approverAtom);

  return (mnemonic: string) => setApprover(Approver.fromMnemonic(mnemonic).connect(PROVIDER));
};
