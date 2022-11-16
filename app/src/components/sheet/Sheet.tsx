import { forwardRef } from 'react';
import BottomSheet, {
  BottomSheetProps,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { makeStyles } from '@theme/makeStyles';

export const CONTENT_HEIGHT_SNAP_POINT = 'CONTENT_HEIGHT';
const DEFAULT_SNAP_POINTS = [CONTENT_HEIGHT_SNAP_POINT];

export interface SheetProps extends Omit<BottomSheetProps, 'ref' | 'snapPoints'> {
  initialSnapPoints: (string | number)[];
}

export const Sheet = forwardRef<BottomSheet, SheetProps>(
  (
    {
      children,
      initialSnapPoints = DEFAULT_SNAP_POINTS,
      style,
      backgroundStyle,
      handleIndicatorStyle,
      ...props
    },
    ref,
  ) => {
    const styles = useStyles();

    const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
      useBottomSheetDynamicSnapPoints(initialSnapPoints);

    return (
      <BottomSheet
        ref={ref}
        handleHeight={animatedHandleHeight}
        snapPoints={animatedSnapPoints}
        contentHeight={animatedContentHeight}
        style={[styles.sheet, style]}
        backgroundStyle={[styles.background, backgroundStyle]}
        handleIndicatorStyle={[styles.handleIndicator, handleIndicatorStyle]}
        {...props}
      >
        <BottomSheetView onLayout={handleContentLayout}>{children}</BottomSheetView>
      </BottomSheet>
    );
  },
);

const useStyles = makeStyles(({ colors }) => {
  const background = colors.surfaceVariant;
  const onBackground = colors.onSurfaceVariant;

  return {
    sheet: {
      // https://ethercreative.github.io/react-native-shadow-generator/
      shadowColor: onBackground,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    background: {
      backgroundColor: background,
    },
    handleIndicator: {
      backgroundColor: onBackground,
    },
  };
});
