import { atom, useAtomValue } from 'jotai';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { asAddress, Hex } from 'lib';
import { persistedAtom } from '~/lib/persistedAtom';
import { secureJsonStorage } from '~/lib/secure-storage/json';

const DANGEROUS_privateKey = persistedAtom<Hex>('Approver', generatePrivateKey, {
  persistInitial: true,
  storage: secureJsonStorage(),
});

export const DANGEROUS_approverAtom = atom(async (get) =>
  privateKeyToAccount(await get(DANGEROUS_privateKey)),
);
export const useApproverWallet = () => useAtomValue(DANGEROUS_approverAtom);

const approverAddress = atom(async (get) => asAddress((await get(DANGEROUS_approverAtom)).address));
export const useApproverAddress = () => useAtomValue(approverAddress);
