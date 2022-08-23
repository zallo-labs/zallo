import { combineRest, combine, simpleKeyExtractor } from '~/gql/combine';
import { WalletId } from '.';
import { useSubUserWalletIds } from './useWalletIds.sub';
import { useApiUserWalletIds } from './useWalletIds.api';

export const useWalletIds = () => {
  const { data: subWalletIds, ...subRest } = useSubUserWalletIds();
  const { data: apiWalletIds, ...apiRest } = useApiUserWalletIds();

  const rest = combineRest(subRest, apiRest);

  const walletIds = combine(
    subWalletIds,
    apiWalletIds,
    simpleKeyExtractor('id'),
    {
      either: ({ sub: s, api: a }): WalletId => ({
        id: s?.id || a!.id,
        accountAddr: s?.accountAddr || a!.accountAddr,
        ref: s?.ref || a!.ref,
      }),
    },
  );

  return { walletIds, ...rest };
};
