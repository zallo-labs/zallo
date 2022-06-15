import {
  BottomSheetScrollView,
  KEYBOARD_STATE,
  useBottomSheetInternal,
} from '@gorhom/bottom-sheet';
import { ChildrenProps } from '@util/children';
import { LayoutChangeEvent, useWindowDimensions, View } from 'react-native';
import { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface SheetScrollRootProps extends ChildrenProps {
  animatedContentHeight: SharedValue<number>;
  handleContentLayout?: (event: LayoutChangeEvent) => void;
}

export const SheetScrollRoot = ({
  children,
  animatedContentHeight,
  handleContentLayout,
}: SheetScrollRootProps) => {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    animatedKeyboardHeight,
    animatedKeyboardState,
    animatedHandleHeight,
    // animatedContentHeight is wrong, props.animatedContentHeight is correct 🤷
  } = useBottomSheetInternal();

  const scrollViewAnimatedStyles = useAnimatedStyle(() => {
    const visibleKeyboardHeight =
      animatedKeyboardState.value === KEYBOARD_STATE.SHOWN
        ? animatedKeyboardHeight.value
        : 0;

    const maxViewHeight =
      windowHeight -
      insets.top -
      insets.bottom -
      animatedHandleHeight.value -
      visibleKeyboardHeight;

    return {
      height: Math.min(animatedContentHeight.value, maxViewHeight),
    };
  });

  return (
    <BottomSheetScrollView
      style={scrollViewAnimatedStyles}
      showsVerticalScrollIndicator={false}
    >
      <View onLayout={handleContentLayout}>{children}</View>
    </BottomSheetScrollView>
  );
};
