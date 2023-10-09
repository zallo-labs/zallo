import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { makeStyles } from '@theme/makeStyles';
import { PropsWithChildren } from 'react';
import { Surface } from 'react-native-paper';

export function SheetBackground({
  children,
  style,
}: PropsWithChildren<BottomSheetBackgroundProps>) {
  const styles = useStyles();

  return (
    <Surface elevation={2} style={[styles.background, style]}>
      {children}
    </Surface>
  );
}

const useStyles = makeStyles(({ corner }) => ({
  background: {
    borderTopLeftRadius: corner.xl,
    borderTopRightRadius: corner.xl,
  },
}));
