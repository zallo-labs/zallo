import { createStyles, useStyles } from '@theme/styles';
import { useDrawerActions } from './DrawerContextProvider';
import { MenuIcon } from '#/Appbar/AppbarMenu';
import { ReactNode } from 'react';
import { ICON_SIZE } from '@theme/paper';
import { View } from 'react-native';
import { IconButton } from '#/IconButton';
import { Scrollable } from '#/Scrollable';

export interface RailSurfaceProps {
  children: ReactNode;
  fab?: ReactNode;
}

export function RailSurface({ children, fab }: RailSurfaceProps) {
  const { styles } = useStyles(stylesheet);
  const { toggle } = useDrawerActions();

  return (
    <Scrollable contentContainerStyle={styles.container}>
      <View style={styles.top}>
        <IconButton icon={MenuIcon} size={ICON_SIZE.small} onPress={toggle} />
        {fab}
      </View>

      <View style={styles.content}>{children}</View>
    </Scrollable>
  );
}

const stylesheet = createStyles(({ colors }, { insets }) => ({
  container: {
    width: 80,
    paddingTop: insets.top + 16,
    paddingBottom: insets.bottom + 16,
    backgroundColor: colors.surfaceContainer.low,
  },
  top: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
}));
