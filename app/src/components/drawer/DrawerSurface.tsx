import { Surface, SurfaceProps } from 'react-native-paper';
import { ScrollViewProps } from 'react-native';
import { DrawerType, useDrawerType } from './DrawerContextProvider';
import { createStyles, useStyles } from '@theme/styles';
import { Scrollable } from '#/Scrollable';

const surfaceTypeProps: Record<DrawerType, Partial<SurfaceProps>> = {
  standard: { mode: 'flat', elevation: 0 },
  modal: { mode: 'elevated', elevation: 1 },
};

export interface DrawerSurfaceProps extends ScrollViewProps {}

export function DrawerSurface(props: DrawerSurfaceProps) {
  const { styles } = useStyles(stylesheet);
  const type = useDrawerType();

  return (
    <Surface {...surfaceTypeProps[type]} style={styles.surface}>
      <Scrollable
        {...props}
        contentContainerStyle={[styles.container, props.contentContainerStyle]}
      />
    </Surface>
  );
}

const stylesheet = createStyles(({ corner }, { insets }) => ({
  surface: {
    flex: 1,
    borderTopRightRadius: corner.l,
    borderBottomRightRadius: corner.l,
  },
  container: {
    paddingTop: insets.top + 12,
    paddingBottom: insets.bottom,
  },
}));
