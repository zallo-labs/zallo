import {
  ComponentPropsWithoutRef,
  forwardRef,
  MutableRefObject,
  useMemo,
} from 'react';
import BottomSheet, {
  BottomSheetScrollView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { useTheme } from 'react-native-paper';
import { SheetBackground } from './SheetBackground';
import { ChildrenProps } from '@util/children';
import { useWindowDimensions, View } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';

type BottomSheetProps = Omit<
  Partial<ComponentPropsWithoutRef<typeof BottomSheet>>,
  'children' | 'snapPoints'
>;

export interface SheetProps extends ChildrenProps, BottomSheetProps {
  initialSnapPoints?: string[];
}

export const Sheet = forwardRef(
  (
    { children, initialSnapPoints = [], ...bottomSheetProps }: SheetProps,
    ref: MutableRefObject<BottomSheet>,
  ) => {
    const { colors } = useTheme();

    const snapPoints = useMemo(
      () => [...initialSnapPoints, 'CONTENT_HEIGHT'],
      [initialSnapPoints],
    );

    const {
      animatedHandleHeight,
      animatedSnapPoints,
      animatedContentHeight,
      handleContentLayout,
    } = useBottomSheetDynamicSnapPoints(snapPoints);

    const { height: windowHeight } = useWindowDimensions();
    const scrollViewAnimatedStyles = useAnimatedStyle(() => {
      const contentHeight = animatedContentHeight.value;
      const handleHeight = animatedHandleHeight.value;

      return { height: Math.min(contentHeight, windowHeight - handleHeight) };
    });

    return (
      <BottomSheet
        ref={ref}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        backgroundComponent={SheetBackground}
        handleIndicatorStyle={{ backgroundColor: colors.onSurface }}
        {...bottomSheetProps}
      >
        <BottomSheetScrollView style={scrollViewAnimatedStyles}>
          <View onLayout={handleContentLayout}>{children}</View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);
