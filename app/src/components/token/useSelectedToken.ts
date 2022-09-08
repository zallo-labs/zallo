import { persistAtom } from '~/util/effect/persistAtom';
import { Address } from 'lib';
import {
  atom,
  DefaultValue,
  selector,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { Token } from '@token/token';
import { USDC } from '@token/tokens';
import { TOKEN } from '@token/useToken';

const SELECTED_TOKEN_ADDRESS = atom<Address>({
  key: 'selectedTokenAddress',
  default: USDC.addr,
  effects: [persistAtom()],
});

const SELECTED_TOKEN = selector<Token>({
  key: 'selectedToken',
  get: ({ get }) => {
    const addr = get(SELECTED_TOKEN_ADDRESS);
    return get(TOKEN(addr));
  },
  set: ({ set }, token) => {
    set(
      SELECTED_TOKEN_ADDRESS,
      token instanceof DefaultValue ? token : token.addr,
    );
  },
});

export const useSelectedToken = () => useRecoilValue(SELECTED_TOKEN);

export const useSelectToken = () => useSetRecoilState(SELECTED_TOKEN);
