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
    <Surface elevation={1} style={[styles.background, style]}>
      {children}
    </Surface>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
  background: {
    backgroundColor: colors.surfaceContainer.low,
    borderTopLeftRadius: corner.xl,
    borderTopRightRadius: corner.xl,
  },
}));
