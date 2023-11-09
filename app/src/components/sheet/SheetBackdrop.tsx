import { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { createStyles, useStyles } from '@theme/styles';

export function SheetBackdrop(props: BottomSheetBackdropProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <BottomSheetBackdrop
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      {...props}
      style={[props.style, styles.backdrop]}
    />
  );
}

const stylesheet = createStyles(({ colors }) => ({
  backdrop: {
    backgroundColor: colors.backdrop,
  },
}));
