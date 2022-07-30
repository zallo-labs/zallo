import { persistAtom } from '@util/effect/persistAtom';
import { Address, GroupRef, toGroupRef } from 'lib';
import { useCallback, useMemo } from 'react';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { CombinedAccount } from '~/queries/safe';
import { useSafes } from '~/queries/safe/useSafes';

type AccountKey = [Address, GroupRef];

const selectedAccount = atom<AccountKey | null>({
  key: 'selectedAccount',
  default: null,
  effects: [persistAtom()],
});

export const useSelectedAccount = (): CombinedAccount => {
  const { safes } = useSafes();
  const [safeAddr, accRef]: AccountKey = useRecoilValue(selectedAccount) ?? [
    safes[0]!.safe.address,
    toGroupRef(safes[0].groups[0].ref),
  ];

  return useMemo(() => {
    const safe = safes.find(({ safe }) => safe.address === safeAddr)!;
    const group = safe.groups.find((g) => g.ref === accRef)!;

    return { ...group, safe };
  }, [accRef, safeAddr, safes]);
};

export const useSelectAccount = () => {
  const select = useSetRecoilState(selectedAccount);

  return useCallback(
    (acc: CombinedAccount) => select([acc.safe.safe.address, acc.ref]),
    [select],
  );
};
