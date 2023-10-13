import { atom, useAtom } from 'jotai';
import { ReactNode, useMemo } from 'react';
import { Drawer as DrawerLayout } from 'react-native-drawer-layout';
import { DrawerContent } from '~/components/drawer/DrawerContent';
import { makeStyles } from '@theme/makeStyles';
import { useLayout } from '~/hooks/useLayout';
import { DrawerContextProvider, DrawerType } from './DrawerContextProvider';

export interface DrawerProps {
  children: ReactNode;
}

// TODO: only use 'modal' type in compact and medium layouts
export function Drawer({ children }: DrawerProps) {
  const layout = useLayout();
  const type: DrawerType = layout.class === 'expanded' ? 'standard' : 'modal';
  const styles = useStyles(type);

  const openAtom = useMemo(() => atom(false), []);
  const [open, setOpen] = useAtom(openAtom);

  return (
    <DrawerContextProvider openAtom={openAtom} toggle={() => setOpen((open) => !open)} type={type}>
      <DrawerLayout
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        drawerPosition="left"
        drawerType={type === 'standard' ? 'permanent' : 'front'}
        drawerStyle={styles.drawer}
        overlayStyle={styles.overlay}
        layout={layout}
        renderDrawerContent={DrawerContent}
      >
        {children}
      </DrawerLayout>
    </DrawerContextProvider>
  );
}

const useStyles = makeStyles(({ colors }, type: DrawerType) => ({
  drawer: {
    backgroundColor: 'transparent',
    width: 360,
  },
  overlay: {
    backgroundColor: colors.scrim,
  },
}));
