import { createStyles, useStyles } from '@theme/styles';
import { ReactNode, useLayoutEffect } from 'react';
import { View } from 'react-native';
import { useSideSheetType } from './SideSheetSurface';
import { PortalHost } from '@gorhom/portal';
import { atom, useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

export const SIDE_SHEET = atom(false);

export interface SideSheetLayoutProps {
  children: ReactNode;
  defaultVisible?: boolean;
}

export function SideSheetLayout({ children, defaultVisible = false }: SideSheetLayoutProps) {
  const { styles } = useStyles(stylesheet);
  const showSheet = useSetAtom(SIDE_SHEET);

  const showByDefault = useSideSheetType() === 'standard' && defaultVisible;
  useHydrateAtoms(new Map([[SIDE_SHEET, showByDefault]]));
  useLayoutEffect(() => {
    showSheet(showByDefault);
  }, [showSheet, showByDefault]);

  return (
    <View style={styles.container}>
      <>{children}</>
      <PortalHost name={SideSheetLayout.name} />
    </View>
  );
}

const stylesheet = createStyles({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
});
