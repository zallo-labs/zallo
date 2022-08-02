import { useWallet } from '@features/wallet/useWallet';
import { combineRest } from '@gql/combine';
import { Address, connectSafe, toId } from 'lib';
import { useMemo } from 'react';
import { SAFE_IMPL } from '~/provider';
import { CombinedSafe } from '.';
import { useApiSafe } from './useSafe.api';
import { useSubSafe } from './useSafe.sub';

export const useSafe = (safeAddr: Address) => {
  const wallet = useWallet();
  const { data: subSafe, ...subRest } = useSubSafe(safeAddr);
  const { data: apiSafe, ...apiRest } = useApiSafe(safeAddr);

  const safe = useMemo(
    (): CombinedSafe => ({
      id: toId(safeAddr),
      contract: connectSafe(safeAddr, wallet),
      impl: subSafe?.impl ?? apiSafe?.impl ?? SAFE_IMPL,
      deploySalt: apiSafe?.deploySalt,
      name: apiSafe?.name ?? '',
    }),
    [
      safeAddr,
      wallet,
      subSafe?.impl,
      apiSafe?.impl,
      apiSafe?.deploySalt,
      apiSafe?.name,
    ],
  );

  const rest = useMemo(() => combineRest(subRest, apiRest), [apiRest, subRest]);

  return { safe, ...rest };
};
