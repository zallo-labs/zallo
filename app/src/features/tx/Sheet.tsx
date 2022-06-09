import {
  ComponentPropsWithoutRef,
  forwardRef,
  MutableRefObject,
  useCallback,
  useMemo,
} from 'react';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { useTheme } from 'react-native-paper';
import { TxSheetBackground } from './TxSheetBackground';
import { ChildrenProps } from '@util/children';

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

    const handleSheetChanges = useCallback((index: number) => {
      //
    }, []);

    // TODO: fix scroll view https://github.com/gorhom/react-native-bottom-sheet/issues/658
    return (
      <BottomSheet
        ref={ref}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        onChange={handleSheetChanges}
        backgroundComponent={TxSheetBackground}
        handleIndicatorStyle={{
          backgroundColor: colors.onSurface,
        }}
        {...bottomSheetProps}
      >
        {/* <BottomSheetScrollView onLayout={handleContentLayout}>
          {children}
        </BottomSheetScrollView> */}
        <BottomSheetView onLayout={handleContentLayout}>
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);
