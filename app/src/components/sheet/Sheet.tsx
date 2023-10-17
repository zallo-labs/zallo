import { forwardRef, useEffect } from 'react';
import BottomSheet, {
  BottomSheetProps,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { makeStyles } from '@theme/makeStyles';
import { StyleProp, View, ViewStyle } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { SheetBackground } from '~/components/sheet/SheetBackground';
import { SheetBackdrop } from '~/components/sheet/SheetBackdrop';
import { useLayout } from '~/hooks/useLayout';

export const CONTENT_HEIGHT_SNAP_POINT = 'CONTENT_HEIGHT';
const DEFAULT_SNAP_POINTS = [CONTENT_HEIGHT_SNAP_POINT];

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
    const router = useRouter();

    const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
      useBottomSheetDynamicSnapPoints(initialSnapPoints);

    return (
      <BottomSheet
        ref={ref}
        handleHeight={animatedHandleHeight}
        snapPoints={animatedSnapPoints}
        contentHeight={animatedContentHeight}
        backgroundComponent={SheetBackground}
        backgroundStyle={styles.background}
        backdropComponent={SheetBackdrop}
        enablePanDownToClose
        onClose={router.back}
        {...props}
        {...(!handle && { handleComponent: () => <View style={styles.emptyHandle} /> })}
        handleStyle={[styles.handle, props.handleStyle]}
        handleIndicatorStyle={[styles.handleIndicator, props.handleIndicatorStyle]}
      >
        <BottomSheetView
          onLayout={handleContentLayout}
          style={[styles.contentContainer, contentContainerStyle]}
        >
          <Stack.Screen options={{ presentation: 'transparentModal', headerShown: false }} />
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const useStyles = makeStyles(({ colors, layout }, insets: EdgeInsets) => ({
  background: {
    ...(layout === 'expanded' && { marginHorizontal: 56 }),
  },
  emptyHandle: {
    height: 12,
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
    ...(layout === 'expanded' && { marginHorizontal: 56 }),
  },
}));
