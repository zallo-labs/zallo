import { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { makeStyles } from '@theme/makeStyles';

export function SheetBackdrop(props: BottomSheetBackdropProps) {
  const styles = useStyles();

  return (
    <BottomSheetBackdrop
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      {...props}
      style={[props.style, styles.backdrop]}
    />
  );
}

const useStyles = makeStyles(({ colors }) => ({
  backdrop: {
    backgroundColor: colors.backdrop,
  },
}));
