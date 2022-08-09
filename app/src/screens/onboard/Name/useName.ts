import { persistAtom } from '@util/effect/persistAtom';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';

const name = atom<string>({
  key: 'name',
  default: '',
  effects: [
    persistAtom({
      saveIf: (v) => v.length > 0,
    }),
  ],
});

export const useName = () => useRecoilValue(name);

export const useSetName = () => useSetRecoilState(name);
