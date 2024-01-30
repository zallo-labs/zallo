import { createStyles, useStyles } from '@theme/styles';
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { ScreenSurface } from './ScreenSurface';

export interface ScreenSurfaceProps extends ScrollViewProps {
  surfaceStyle?: StyleProp<ViewStyle>;
}

export function ScrollableScreenSurface({ children, ...scrollViewProps }: ScreenSurfaceProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <ScreenSurface>
      <ScrollView
        {...scrollViewProps}
        contentContainerStyle={[styles.contentContainer, scrollViewProps.contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </ScreenSurface>
  );
}

const stylesheet = createStyles({
  contentContainer: {
    flex: 1,
  },
});
