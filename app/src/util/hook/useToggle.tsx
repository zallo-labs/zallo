import { useCallback, useState } from 'react';

export const useToggle = (initialState: boolean | (() => boolean)) => {
  const [enabled, setEnabled] = useState(initialState);
  const toggle = useCallback(() => setEnabled((enabled) => !enabled), []);

  return [enabled, toggle, setEnabled] as const;
};
