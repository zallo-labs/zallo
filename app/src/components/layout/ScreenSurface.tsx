import { createStyles, useStyles } from '@theme/styles';
import { Surface, SurfaceProps } from 'react-native-paper';
import { useMaybeDrawerContext } from '#/drawer/DrawerContextProvider';

export function ScreenSurface(props: SurfaceProps) {
  const { styles } = useStyles(stylesheet);

  return useMaybeDrawerContext()?.type === 'standard' ? (
    <Surface elevation={0} {...props} style={[styles.surface, props.style]} />
  ) : (
    <>{props.children}</>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
  surface: {
    flex: 1,
    marginTop: 8,
    marginBottom: 16,
    marginRight: 16,
    borderRadius: corner.l,
    backgroundColor: colors.surface,
  },
}));
