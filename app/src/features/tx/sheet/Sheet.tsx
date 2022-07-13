import {
  ComponentPropsWithoutRef,
  ForwardedRef,
  forwardRef,
  useMemo,
} from 'react';
import BottomSheet, {
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { useTheme } from 'react-native-paper';
import { SheetBackground } from './SheetBackground';
import { ChildrenProps } from '@util/children';
import { SheetScrollRoot } from './SheetScrollRoot';
import { SheetBackdrop } from './SheetBackdrop';

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
    ref: ForwardedRef<BottomSheet>,
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

    return (
      <BottomSheet
        ref={ref}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        backgroundComponent={SheetBackground}
        backdropComponent={SheetBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.onSurface }}
        keyboardBlurBehavior="restore"
        {...bottomSheetProps}
      >
        <SheetScrollRoot
          animatedContentHeight={animatedContentHeight}
          handleContentLayout={handleContentLayout}
        >
          {children}
        </SheetScrollRoot>
      </BottomSheet>
    );
  },
);
