import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { createStyles, useStyles } from '@theme/styles';
import { PropsWithChildren } from 'react';
import { Surface } from 'react-native-paper';

export function SheetBackground({
  children,
  style,
}: PropsWithChildren<BottomSheetBackgroundProps>) {
  const { styles } = useStyles(stylesheet);

  return (
    <Surface elevation={2} style={[styles.background, style]}>
      {children}
    </Surface>
  );
}

const stylesheet = createStyles(({ corner }) => ({
  background: {
    borderTopLeftRadius: corner.xl,
    borderTopRightRadius: corner.xl,
  },
}));
