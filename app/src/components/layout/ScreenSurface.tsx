import { createStyles, useStyles } from '@theme/styles';
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { MaybeSurface } from './MaybeSurface';

export interface ScreenSurfaceProps extends ScrollViewProps {
  surfaceStyle?: StyleProp<ViewStyle>;
}

export function ScreenSurface({ children, ...scrollViewProps }: ScreenSurfaceProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <MaybeSurface>
      <ScrollView
        {...scrollViewProps}
        contentContainerStyle={[styles.contentContainer, scrollViewProps.contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </MaybeSurface>
  );
}

const stylesheet = createStyles({
  contentContainer: {
    flex: 1,
  },
});
