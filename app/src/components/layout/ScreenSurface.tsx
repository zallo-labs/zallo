import { createStyles, useStyles } from '@theme/styles';
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { Surface, SurfaceProps } from 'react-native-paper';
import { useMaybeDrawerContext } from '~/components/drawer/DrawerContextProvider';

export interface ScreenSurfaceProps extends ScrollViewProps {
  surfaceStyle?: StyleProp<ViewStyle>;
}

export function ScreenSurface({ children, surfaceStyle, ...scrollViewProps }: ScreenSurfaceProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <MaybeSurface elevation={0} style={[styles.surface, surfaceStyle]}>
      <ScrollView
        {...scrollViewProps}
        contentContainerStyle={[styles.contentContainer, scrollViewProps.contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </MaybeSurface>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
  surface: {
    flex: 1,
    marginTop: 8,
    marginBottom: 16,
    marginRight: 16,
    borderRadius: corner.l,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
  },
}));

function MaybeSurface(props: SurfaceProps) {
  return useMaybeDrawerContext()?.type !== 'standard' ? (
    <>{props.children}</>
  ) : (
    <Surface {...props} />
  );
}
