import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { ScreenSurface } from '../layout/ScreenSurface';
import { ReactNode } from 'react';
import { StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { Surface } from 'react-native-paper';
import { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { BREAKPOINTS } from '@theme/styles';
import { Modal as CustomModal } from '../Modal';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

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
    <ScreenSurface style={[styles.contentContainer, contentStyle]}>{children}</ScreenSurface>
  ) : (
    <CustomModal close={close} entering={SlideInRight} exiting={SlideOutRight} style={styles.modal}>
      <Surface
        style={[styles.modalContentContainer(insets), styles.contentContainer, contentStyle]}
      >
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
  modalContentContainer: (insets: EdgeInsets) => ({
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
  return useWindowDimensions().width >= BREAKPOINTS.large ? 'standard' : 'modal';
}
