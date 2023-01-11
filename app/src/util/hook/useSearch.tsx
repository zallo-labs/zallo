import FuzzySearch from 'fuzzy-search';
import { useMemo, useState } from 'react';

export interface SearchInputProps {
  value: string | undefined;
  onChangeText: (input?: string) => void;
}

export const useSearch = <T extends object>(
  allValues: T[],
  keys: (keyof T)[],
  options?: FuzzySearch.Options,
): [T[], SearchInputProps] => {
  const [input, setInput] = useState<string | undefined>();

  const searchProps: SearchInputProps = useMemo(
    () => ({ value: input, onChangeText: setInput }),
    [input],
  );

  const searcher = useMemo(
    () =>
      new FuzzySearch(allValues, keys as string[], {
        caseSensitive: false,
        ...options,
      }),
    [allValues, keys, options],
  );

  const values = useMemo(() => searcher.search(input), [input, searcher]);

  return [values, searchProps];
};
