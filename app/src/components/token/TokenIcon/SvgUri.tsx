import { SvgProps, SvgXml } from 'react-native-svg';
import { atomFamily, useRecoilValue } from 'recoil';
import { persistAtom } from '~/util/effect/persistAtom';

const fetchState = atomFamily<string | null, string>({
  key: 'uriXml',
  default: async (uri): Promise<string | null> => {
    const resp = await fetch(uri);
    return resp.ok ? await resp.text() : null;
  },
  effects: [
    persistAtom({
      saveIf: (xml) => xml !== null,
    }),
  ],
});

export interface SvgUriProps extends SvgProps {
  uri: string;
  onError?: () => void;
}

export const SvgUri = ({ uri, onError, ...svgProps }: SvgUriProps) => {
  const xml = useRecoilValue(fetchState(uri));

  if (xml === null) {
    onError?.();
    return null;
  }

  return <SvgXml xml={xml} override={svgProps} />;
};
