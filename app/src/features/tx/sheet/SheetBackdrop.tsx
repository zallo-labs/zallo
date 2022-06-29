import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

export interface SheetBackdropProps extends BottomSheetBackdropProps {}

export const SheetBackdrop = (props: SheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    // Required to fix: https://github.com/gorhom/react-native-bottom-sheet/issues/968
    appearsOnIndex={0}
    disappearsOnIndex={-1}
  />
);
