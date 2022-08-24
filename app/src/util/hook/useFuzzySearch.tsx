import FuzzySearch from 'fuzzy-search';
import { useMemo, useState } from 'react';

export interface FuzzySearchProps {
  input: string | undefined;
  setInput: (input?: string) => void;
}

export const useFuzzySearch = <T extends object>(
  allValues: T[],
  keys: (keyof T)[],
): [T[], FuzzySearchProps] => {
  const [input, setInput] = useState<string | undefined>();

  const searchProps: FuzzySearchProps = useMemo(
    () => ({ input, setInput }),
    [input],
  );

  const searcher = useMemo(
    () =>
      new FuzzySearch(allValues, keys as string[], {
        caseSensitive: false,
      }),
    [allValues, keys],
  );

  const values = useMemo(() => searcher.search(input), [input, searcher]);

  return [[...values], searchProps];
};
