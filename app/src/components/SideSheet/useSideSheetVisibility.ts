import { useMemo, useState } from 'react';
import { useSideSheetType } from './SideSheetSurface';

export function useSideSheetVisibility() {
  const type = useSideSheetType();
  const [visible, setVisible] = useState(type === 'standard');

  return useMemo(
    () => ({
      visible,
      toggle: () => setVisible((v) => !v),
      close: () => setVisible(false),
    }),
    [visible],
  );
}
