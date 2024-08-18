import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { Modal } from '../Modal';
import { Surface } from '#/layout/Surface';
import { useSideSheetType } from './SideSheetLayout';

export interface SideSheetContainerProps {
  children: ReactNode;
  close: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  surfaceStyle?: StyleProp<ViewStyle>;
}

export function SideSheetContainer({ children, close, contentStyle }: SideSheetContainerProps) {
  const { styles } = useStyles(stylesheet);
  const type = useSideSheetType();

  return type === 'standard' ? (
    <View style={[styles.standardSurface, contentStyle]}>{children}</View>
  ) : (
    <Modal close={close} entering={SlideInRight} exiting={SlideOutRight} style={styles.modal}>
      <Surface style={[styles.modalSurface, contentStyle]}>{children}</Surface>
    </Modal>
  );
}

const stylesheet = createStyleSheet(({ colors, corner }, { insets }) => ({
  standardSurface: {
    width: '100%',
    minWidth: 256,
    maxWidth: 400,
    marginBottom: insets.bottom + 16,
    marginRight: 16,
  },
  modal: {
    flex: 1,
    marginLeft: 'auto',
  },
  modalSurface: {
    flex: 1,
    width: 400, // minWidth is always used in modal on android
    borderTopLeftRadius: corner.l,
    borderBottomLeftRadius: corner.l,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left + 16,
    paddingRight: insets.right + 16,
    backgroundColor: colors.surfaceContainer.low,
  },
}));
