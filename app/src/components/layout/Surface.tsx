import { Surface as Base, SurfaceProps as BaseProps } from 'react-native-paper';
import { createStyles, useStyles } from '@theme/styles';

export type SurfaceProps = BaseProps;

export function Surface(props: SurfaceProps) {
  const { styles } = useStyles(stylesheet);

  return <Base elevation={0} {...props} style={[styles.surface, props.style]} />;
}

const stylesheet = createStyles(({ colors, corner }) => ({
  surface: {
    borderRadius: corner.l,
    backgroundColor: colors.surface,
  },
}));
