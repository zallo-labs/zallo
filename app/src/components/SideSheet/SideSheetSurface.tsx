import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { ReactNode } from 'react';
import { StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { BREAKPOINTS } from '@theme/styles';
import { Modal } from '../Modal';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Surface } from '#/layout/Surface';

export interface SideSheetSurfaceProps {
  children: ReactNode;
  close: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  surfaceStyle?: StyleProp<ViewStyle>;
}

export function SideSheetSurface({ children, close, contentStyle }: SideSheetSurfaceProps) {
  const { styles } = useStyles(stylesheet);
  const type = useSideSheetType();
  const insets = useSafeAreaInsets();

  return type === 'standard' ? (
    <Surface style={[styles.standardSurface(insets), contentStyle]}>{children}</Surface>
  ) : (
    <Modal close={close} entering={SlideInRight} exiting={SlideOutRight} style={styles.modal}>
      <Surface style={[styles.modalSurface(insets), contentStyle]}>{children}</Surface>
    </Modal>
  );
}

const stylesheet = createStyleSheet(({ corner }) => ({
  standardSurface: (insets: EdgeInsets) => ({
    width: '100%',
    minWidth: 256,
    maxWidth: 400,
    marginBottom: insets.bottom + 16,
  }),
  modal: {
    flex: 1,
    marginLeft: 'auto',
  },
  modalSurface: (insets: EdgeInsets) => ({
    flex: 1,
    width: 400, // minWidth is always used in modal on android
    borderTopLeftRadius: corner.l,
    borderBottomLeftRadius: corner.l,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  }),
}));

export type SideSheetType = 'standard' | 'modal';

export function useSideSheetType(): SideSheetType {
  return useWindowDimensions().width >= BREAKPOINTS.extraLarge ? 'standard' : 'modal';
}
