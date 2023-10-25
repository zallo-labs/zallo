import { makeStyles } from '@theme/makeStyles';
import { Surface, SurfaceProps } from 'react-native-paper';
import { useMaybeDrawerContext } from '~/components/drawer/DrawerContextProvider';

export interface ScreenSurfaceProps extends SurfaceProps {}

export function ScreenSurface(props: ScreenSurfaceProps) {
  const styles = useStyles();
  const drawer = useMaybeDrawerContext();

  if (drawer?.type !== 'standard') return <>{props.children}</>;

  return <Surface elevation={0} {...props} style={[styles.container, props.style]} />;
}

const useStyles = makeStyles(({ colors, corner }) => ({
  container: {
    flex: 1,
    marginTop: 8,
    marginBottom: 16,
    marginRight: 16,
    borderRadius: corner.l,
    backgroundColor: colors.background,
  },
}));
