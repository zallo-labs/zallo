import { useMemo, useState } from 'react';
import { useSideSheetType } from './SideSheetSurface';

export function useSideSheetVisibility() {
  const type = useSideSheetType();
  const [visible, setVisible] = useState(type === 'standard');

  return useMemo(
    () => ({
      visible,
      open: () => setVisible(true),
      close: () => setVisible(false),
    }),
    [visible],
  );
}
