import { forwardRef, PropsWithChildren } from 'react';
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetProps,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { makeStyles } from '@theme/makeStyles';
import { Surface } from 'react-native-paper';

export const CONTENT_HEIGHT_SNAP_POINT = 'CONTENT_HEIGHT';
const DEFAULT_SNAP_POINTS = [CONTENT_HEIGHT_SNAP_POINT];

const Background = ({ children, style }: PropsWithChildren<BottomSheetBackgroundProps>) => (
  <Surface elevation={1} style={style}>
    {children}
  </Surface>
);

export interface SheetProps extends Omit<BottomSheetProps, 'ref' | 'snapPoints'> {
  initialSnapPoints?: (string | number)[];
  handle?: boolean;
}

export const Sheet = forwardRef<BottomSheet, SheetProps>(
  ({ children, initialSnapPoints = DEFAULT_SNAP_POINTS, handle = true, ...props }, ref) => {
    const styles = useStyles();

    const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
      useBottomSheetDynamicSnapPoints(initialSnapPoints);

    return (
      <BottomSheet
        ref={ref}
        handleHeight={animatedHandleHeight}
        snapPoints={animatedSnapPoints}
        contentHeight={animatedContentHeight}
        backgroundComponent={Background}
        // backdropComponent={SheetBackdrop}
        enablePanDownToClose={handle}
        {...props}
        {...(!handle && { handleComponent: null })}
        // containerStyle={[styles.container, props.containerStyle]}
        backgroundStyle={[styles.background, props.backgroundStyle]}
        handleStyle={[styles.handle, props.handleStyle]}
        handleIndicatorStyle={[styles.handleIndicator, props.handleIndicatorStyle]}
      >
        <BottomSheetView onLayout={handleContentLayout} style={styles.contentContainer}>
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const useStyles = makeStyles(({ colors, s, corner }) => ({
  container: {
    // backgroundColor: colors.scrim,
  },
  background: {
    borderTopLeftRadius: corner.xl,
    borderTopRightRadius: corner.xl,
  },
  handle: {
    marginTop: s(8),
  },
  handleIndicator: {
    backgroundColor: colors.onSurfaceVariant,
    width: s(32),
    heigh: s(4),
  },
  contentContainer: {
    // paddingVertical isn't setting paddingBottom...
    paddingTop: s(24),
    paddingBottom: s(24),
  },
}));
