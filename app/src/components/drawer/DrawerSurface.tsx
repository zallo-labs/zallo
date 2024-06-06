import { Surface, SurfaceProps } from 'react-native-paper';
import { ScrollView, ScrollViewProps } from 'react-native';
import { DrawerType, useDrawerType } from './DrawerContextProvider';
import { createStyles, useStyles } from '@theme/styles';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

const surfaceTypeProps: Record<DrawerType, Partial<SurfaceProps>> = {
  standard: { mode: 'flat', elevation: 0 },
  modal: { mode: 'elevated', elevation: 1 },
};

export interface DrawerSurfaceProps extends ScrollViewProps {}

export function DrawerSurface(props: DrawerSurfaceProps) {
  const { styles } = useStyles(stylesheet);
  const type = useDrawerType();
  const insets = useSafeAreaInsets();

  return (
    <Surface {...surfaceTypeProps[type]} style={styles.surface}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        {...props}
        contentContainerStyle={[styles.container(insets), props.contentContainerStyle]}
      />
    </Surface>
  );
}

const stylesheet = createStyles(({ corner }) => ({
  surface: {
    flex: 1,
    borderTopRightRadius: corner.l,
    borderBottomRightRadius: corner.l,
  },
  container: (insets: EdgeInsets) => ({
    paddingTop: insets.top + 12,
    paddingBottom: insets.bottom,
  }),
}));
