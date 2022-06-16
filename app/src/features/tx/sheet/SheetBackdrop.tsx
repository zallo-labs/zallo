import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from 'react-native-paper';

export interface SheetBackdropProps extends BottomSheetBackdropProps {}

export const SheetBackdrop = (props: SheetBackdropProps) => {
  const { colors } = useTheme();

  return (
    <>
      <BottomSheetBackdrop
        {...props}
        // Required to fix: https://github.com/gorhom/react-native-bottom-sheet/issues/968
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />

      <StatusBar style="inverted" backgroundColor={colors.backdrop} />
    </>
  );
};
