import { Surface, SurfaceProps } from '#/layout/Surface';
import { createStyles, useStyles } from '@theme/styles';
import { useDrawerActions } from './DrawerContextProvider';
import { MenuIcon } from '#/Appbar/AppbarMenu';
import { ReactNode } from 'react';
import { ICON_SIZE } from '@theme/paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { IconButton } from '#/IconButton';

export interface RailSurfaceProps extends SurfaceProps {
  fab?: ReactNode;
}

export function RailSurface({ children, fab, ...surfaceProps }: RailSurfaceProps) {
  const { styles } = useStyles(stylesheet);
  const { toggle } = useDrawerActions();
  const insets = useSafeAreaInsets();

  return (
    <Surface elevation={0} {...surfaceProps} style={[styles.surface(insets), surfaceProps.style]}>
      <View style={styles.top}>
        <IconButton icon={MenuIcon} size={ICON_SIZE.small} onPress={toggle} />
        {fab}
      </View>

      <View style={styles.content}>{children}</View>
      {/* <View style={styles.content} /> */}
    </Surface>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
  surface: (insets: EdgeInsets) => ({
    flex: 1,
    width: 80,
    // paddingHorizontal: 12,
    paddingTop: insets.top + 44,
    paddingBottom: insets.bottom + 56,
    backgroundColor: colors.surfaceContainer.low,
  }),
  top: {
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
}));
