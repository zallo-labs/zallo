import { createStyles, useStyles } from '@theme/styles';
import { createContext, ReactNode, useContext, useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import { atom, useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

export const SIDE_SHEET = atom(false);

export type SideSheetType = 'standard' | 'modal';
const SideSheetType = createContext<SideSheetType>('modal');
export const useSideSheetType = () => useContext(SideSheetType);

export interface SideSheetLayoutProps {
  children: ReactNode;
  defaultVisible?: boolean;
}

export function SideSheetLayout({ children, defaultVisible = false }: SideSheetLayoutProps) {
  const { styles } = useStyles(stylesheet);
  const showSheet = useSetAtom(SIDE_SHEET);

  const [width, setWidth] = useState(0);
  const type: SideSheetType = width >= 1000 ? 'standard' : 'modal';

  const showByDefault = type === 'standard' && defaultVisible;
  useHydrateAtoms(new Map([[SIDE_SHEET, showByDefault]]));
  useLayoutEffect(() => {
    showSheet(showByDefault);
  }, [showSheet, showByDefault]);

  return (
    <SideSheetType.Provider value={type}>
      <View style={styles.container} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {children}
      </View>
    </SideSheetType.Provider>
  );
}

const stylesheet = createStyles({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
});
