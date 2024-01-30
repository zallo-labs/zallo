import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { ScreenSurface } from '../layout/ScreenSurface';
import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { BREAKPOINTS } from '@theme/styles';
import { Modal as CustomModal } from '../Modal';

export interface SideSheetSurfaceProps {
  children: ReactNode;
  close: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  surfaceStyle?: StyleProp<ViewStyle>;
}

export function SideSheetSurface({ children, close, contentStyle }: SideSheetSurfaceProps) {
  const { styles } = useStyles(stylesheet);
  const type = useSideSheetType();

  return type === 'standard' ? (
    <ScreenSurface style={[styles.contentContainer, contentStyle]}>{children}</ScreenSurface>
  ) : (
    <CustomModal close={close} entering={SlideInRight} exiting={SlideOutRight} style={styles.modal}>
      <Surface style={[styles.modalContentContainer, styles.contentContainer, contentStyle]}>
        {children}
      </Surface>
    </CustomModal>
  );
}

const stylesheet = createStyleSheet(({ corner }) => ({
  contentContainer: {
    flex: 1,
    minWidth: 256,
    maxWidth: 400,
  },
  modal: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    borderTopLeftRadius: corner.l,
    borderBottomLeftRadius: corner.l,
  },
}));

export function useSideSheetType() {
  // return 'modal' as 'standard' | 'modal';
  return BREAKPOINTS[useStyles().breakpoint] >= BREAKPOINTS.medium ? 'standard' : 'modal';
}
