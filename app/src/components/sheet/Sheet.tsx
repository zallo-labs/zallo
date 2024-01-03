import { forwardRef } from 'react';
import BottomSheet, { BottomSheetProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { StyleProp, View, ViewStyle } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SheetBackground } from '~/components/sheet/SheetBackground';
import { SheetBackdrop } from '~/components/sheet/SheetBackdrop';
import { createStyles, useStyles } from '@theme/styles';

export interface SheetProps extends Omit<BottomSheetProps, 'ref'> {
  initialSnapPoints?: (string | number)[];
  handle?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const Sheet = forwardRef<BottomSheet, SheetProps>(
  ({ children, handle = true, contentContainerStyle, ...props }, ref) => {
    const { styles } = useStyles(stylesheet);
    const router = useRouter();

    return (
      <BottomSheet
        ref={ref}
        enableDynamicSizing
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
          style={[styles.contentContainer(useSafeAreaInsets()), contentContainerStyle]}
        >
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const stylesheet = createStyles(({ colors }) => ({
  background: {
    marginHorizontal: {
      expanded: 56,
    },
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
  contentContainer: (insets: EdgeInsets) => ({
    paddingTop: 8,
    paddingBottom: insets?.bottom,
    marginHorizontal: {
      expanded: 56,
    },
  }),
}));
