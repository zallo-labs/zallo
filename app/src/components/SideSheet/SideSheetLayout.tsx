import { createStyles, useStyles } from '@theme/styles';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { useSideSheetType } from './SideSheetSurface';
import { PortalHost } from '@gorhom/portal';
import { Provider, atom } from 'jotai';
import { AtomsHydrator } from '#/AtomsHydrator';

export const SIDE_SHEET = atom(false);

export interface SideSheetProviderProps {
  children: ReactNode;
  defaultVisible?: boolean;
}

export function SideSheetProvider({ children, defaultVisible = true }: SideSheetProviderProps) {
  const type = useSideSheetType();

  return (
    <Provider>
      <AtomsHydrator atomValues={[[SIDE_SHEET, defaultVisible && type === 'standard']]}>
        {children}
      </AtomsHydrator>
    </Provider>
  );
}

export interface SideSheetLayoutWithoutProvderProps {
  children: ReactNode;
}

export function SideSheetLayoutWithoutProvder({ children }: SideSheetLayoutProps) {
  const { styles } = useStyles(stylesheet);

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

export interface SideSheetLayoutProps {
  children: ReactNode;
  defaultVisible?: boolean;
}

export function SideSheetLayout({ children, defaultVisible }: SideSheetLayoutProps) {
  return (
    <SideSheetProvider defaultVisible={defaultVisible}>
      <SideSheetLayoutWithoutProvder>{children}</SideSheetLayoutWithoutProvder>
    </SideSheetProvider>
  );
}
