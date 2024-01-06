import { PropsWithChildren } from 'react';
import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { Surface } from 'react-native-paper';

import { createStyles, useStyles } from '~/util/theme/styles';

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
