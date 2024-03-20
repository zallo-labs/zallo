import { createStyles } from '@theme/styles';
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { ScreenSurface } from './ScreenSurface';

export interface ScreenSurfaceProps extends ScrollViewProps {
  surfaceStyle?: StyleProp<ViewStyle>;
}

export function ScrollableScreenSurface({ children, ...scrollViewProps }: ScreenSurfaceProps) {
  return (
    <ScreenSurface>
      <ScrollView
        showsVerticalScrollIndicator={false}
        {...scrollViewProps}
        contentContainerStyle={[styles.contentContainer, scrollViewProps.contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </ScreenSurface>
  );
}

const styles = createStyles({
  contentContainer: {
    flexGrow: 1,
  },
});
