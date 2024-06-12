import { UAddress, asUAddress } from 'lib';
import { Subject } from 'rxjs';
import { useGetEvent } from '~/hooks/useGetEvent';
import { SelectTokenSheetParams } from '~/app/(sheet)/select/token';
import { atomFamily } from 'jotai/utils';
import { Chain } from 'chains';
import { useAtomValue, useSetAtom } from 'jotai';
import { ETH, USDC, USDT } from 'lib/dapps';
import { persistedAtom } from '~/lib/persistedAtom';

const TOKEN_SELECTED = new Subject<UAddress>();

const MAX_RECENTS = 20;
const recentsByChain = atomFamily((chain: Chain) =>
  persistedAtom(`recent-tokens:${chain}`, [
    asUAddress(ETH.address[chain], chain),
    asUAddress(USDC.address[chain], chain),
    asUAddress(USDT.address[chain], chain),
  ]),
);

export function useRecentTokens(chain: Chain) {
  return useAtomValue(recentsByChain(chain));
}

export function useSelectToken() {
  const getEvent = useGetEvent();

  return (params: SelectTokenSheetParams) =>
    getEvent({ pathname: `/(sheet)/select/token`, params: params as any }, TOKEN_SELECTED);
}

export function useSetSelectedToken(chain: Chain) {
  const setRecent = useSetAtom(recentsByChain(chain));

  return (token: UAddress) => {
    setRecent((r) => [token, ...r.filter((t) => t !== token).slice(0, MAX_RECENTS)]);
    TOKEN_SELECTED.next(token);
  };
}

export function useSelectedToken(chain: Chain) {
  return useAtomValue(recentsByChain(chain))[0];
}

export function useInvalidateRecentToken(chain: Chain) {
  const setRecent = useSetAtom(recentsByChain(chain));

  return (token: UAddress) => {
    setRecent((r) =>
      r.length > 1 ? r.filter((t) => t !== token) : [asUAddress(ETH.address[chain], chain)],
    );
  };
}
