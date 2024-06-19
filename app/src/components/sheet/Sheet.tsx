import { forwardRef } from 'react';
import BottomSheet, { BottomSheetProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { SheetBackground } from '#/sheet/SheetBackground';
import { SheetBackdrop } from '#/sheet/SheetBackdrop';
import { createStyles, useStyles } from '@theme/styles';

/*
 * https://m3.material.io/components/bottom-sheets/specs
 */

export interface SheetProps extends Omit<BottomSheetProps, 'ref'> {
  initialSnapPoints?: (string | number)[];
  handle?: boolean;
  contentContainer?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const Sheet = forwardRef<BottomSheet, SheetProps>(
  ({ children, handle = true, contentContainer = true, contentContainerStyle, ...props }, ref) => {
    const { styles } = useStyles(stylesheet);
    const router = useRouter();

    return (
      <BottomSheet
        ref={ref}
        enableDynamicSizing
        backgroundComponent={SheetBackground}
        backdropComponent={SheetBackdrop}
        enablePanDownToClose
        onClose={router.back}
        {...(!handle && { handleComponent: NoHandle })}
        {...props}
        containerStyle={[styles.container, props.containerStyle]}
        backgroundStyle={[styles.background, props.backgroundStyle]}
        handleStyle={[styles.handle, props.handleStyle]}
        handleIndicatorStyle={[styles.handleIndicator, props.handleIndicatorStyle]}
      >
        {contentContainer ? (
          <BottomSheetView style={[styles.contentContainer, contentContainerStyle]}>
            {children}
          </BottomSheetView>
        ) : (
          children
        )}
      </BottomSheet>
    );
  },
);

const stylesheet = createStyles(({ colors }, { insets }) => ({
  container: {
    maxWidth: 640 + 56 * 2,
    marginHorizontal: 'auto',
    // paddingHorizontal: {
    //   [mq.only.width(640)]: 56,
    // },
    // marginTop: {
    //   [mq.only.width(640)]: 72,
    // },
  },
  background: {
    // marginHorizontal: {
    //   [mq.only.width(640)]: 56,
    // },
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
    paddingBottom: insets.bottom + 8,
    // marginHorizontal: {
    //   [mq.only.width(640)]: 56,
    // },
  },
}));

function NoHandle() {
  return <View style={noHandleStyles.handle} />;
}

const noHandleStyles = createStyles({
  handle: {
    height: 12,
  },
});
