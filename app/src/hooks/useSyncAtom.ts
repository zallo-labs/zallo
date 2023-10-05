import { WritableAtom, useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { useEffect } from 'react';

export function useSyncAtom<Value>(atom: WritableAtom<Value, [Value], unknown>, value: Value) {
  useHydrateAtoms([[atom, value]]);

  const setAtom = useSetAtom(atom);
  useEffect(() => {
    setAtom(value);
  }, [setAtom, value]);
}
