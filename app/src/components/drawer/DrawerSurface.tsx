import { Surface, SurfaceProps } from 'react-native-paper';
import { ScrollView, ScrollViewProps } from 'react-native';
import { makeStyles } from '@theme/makeStyles';
import { DrawerType, useDrawerContext } from './DrawerContextProvider';

const surfaceTypeProps: Record<DrawerType, Partial<SurfaceProps>> = {
  standard: { mode: 'flat', elevation: 0 },
  modal: { mode: 'elevated', elevation: 1 },
};

export interface DrawerSurfaceProps extends ScrollViewProps {}

export function DrawerSurface(props: DrawerSurfaceProps) {
  const styles = useStyles();
  const { type } = useDrawerContext();

  return (
    <Surface {...surfaceTypeProps[type]} style={styles.surface}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        {...props}
        contentContainerStyle={[styles.container, props.contentContainerStyle]}
      />
    </Surface>
  );
}

const useStyles = makeStyles(({ corner, insets }) => ({
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
