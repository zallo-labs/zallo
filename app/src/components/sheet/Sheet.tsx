import { forwardRef, PropsWithChildren } from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetBackgroundProps,
  BottomSheetProps,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { makeStyles } from '@theme/makeStyles';
import { Surface } from 'react-native-paper';
import { StyleProp, View, ViewStyle } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export const CONTENT_HEIGHT_SNAP_POINT = 'CONTENT_HEIGHT';
const DEFAULT_SNAP_POINTS = [CONTENT_HEIGHT_SNAP_POINT];

const Background = ({ children, style }: PropsWithChildren<BottomSheetBackgroundProps>) => (
  <Surface elevation={1} style={style}>
    {children}
  </Surface>
);

const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    disappearsOnIndex={-1}
    {...props}
    style={[props.style, useStyles().backdrop]}
  />
);

export interface SheetProps extends Omit<BottomSheetProps, 'ref' | 'snapPoints'> {
  initialSnapPoints?: (string | number)[];
  handle?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const Sheet = forwardRef<BottomSheet, SheetProps>(
  (
    {
      children,
      initialSnapPoints = DEFAULT_SNAP_POINTS,
      handle = true,
      contentContainerStyle,
      ...props
    },
    ref,
  ) => {
    const styles = useStyles(useSafeAreaInsets());

    const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
      useBottomSheetDynamicSnapPoints(initialSnapPoints);

    return (
      <BottomSheet
        ref={ref}
        handleHeight={animatedHandleHeight}
        snapPoints={animatedSnapPoints}
        contentHeight={animatedContentHeight}
        backgroundComponent={Background}
        backdropComponent={Backdrop}
        enablePanDownToClose
        {...props}
        {...(!handle && { handleComponent: () => <View style={styles.emptyHandle} /> })}
        backgroundStyle={[styles.background, props.backgroundStyle]}
        handleStyle={[styles.handle, props.handleStyle]}
        handleIndicatorStyle={[styles.handleIndicator, props.handleIndicatorStyle]}
      >
        <BottomSheetView
          onLayout={handleContentLayout}
          style={[styles.contentContainer, contentContainerStyle]}
        >
          <>{children}</>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const useStyles = makeStyles(({ colors, corner }, insets: EdgeInsets) => ({
  background: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: corner.xl,
    borderTopRightRadius: corner.xl,
  },
  emptyHandle: {
    height: 36,
  },
  handle: {
    paddingTop: 16,
  },
  handleIndicator: {
    backgroundColor: colors.onSurfaceVariant,
    width: 32,
    height: 4,
    opacity: 0.4,
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: insets?.bottom,
  },
  backdrop: {
    backgroundColor: colors.scrim,
  },
}));
