import { ScrollView, ScrollViewProps } from 'react-native';
import { Surface, SurfaceProps } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { createStyles, useStyles } from '~/util/theme/styles';
import { DrawerType, useDrawerContext } from './DrawerContextProvider';

const surfaceTypeProps: Record<DrawerType, Partial<SurfaceProps>> = {
  standard: { mode: 'flat', elevation: 0 },
  modal: { mode: 'elevated', elevation: 1 },
};

export interface DrawerSurfaceProps extends ScrollViewProps {}

export function DrawerSurface(props: DrawerSurfaceProps) {
  const { styles } = useStyles(stylesheet);
  const { type } = useDrawerContext();

  return (
    <Surface {...surfaceTypeProps[type]} style={styles.surface}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        {...props}
        contentContainerStyle={[styles.container(useSafeAreaInsets()), props.contentContainerStyle]}
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
