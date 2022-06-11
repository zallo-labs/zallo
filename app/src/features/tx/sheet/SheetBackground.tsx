import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import Animated from 'react-native-reanimated';

const RADIUS = 17;

export const SheetBackground = (props: BottomSheetBackgroundProps) => {
  const { colors } = useTheme();

  const style = useMemo(
    () => [
      props.style,
      {
        backgroundColor: colors.surface,
        borderTopLeftRadius: RADIUS,
        borderTopRightRadius: RADIUS,
      },
    ],
    [props.style, colors.surface],
  );

  return <Animated.View pointerEvents="none" style={style} />;
};
