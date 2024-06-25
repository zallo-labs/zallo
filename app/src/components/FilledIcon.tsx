import { IconProps } from '@theme/icons';
import { CORNER, ICON_SIZE } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { FC } from 'react';
import { Surface, SurfaceProps } from './layout/Surface';

export interface FilledIconProps extends Partial<SurfaceProps> {
  icon: FC<IconProps>;
  size?: number;
}

export function FilledIcon({ icon: Icon, size = ICON_SIZE.medium, ...props }: FilledIconProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <Surface elevation={1} {...props} style={[styles.container(size), props.style]}>
      <Icon color={styles.icon.color} size={(size * 2) / 3} />
    </Surface>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: (size: number) => ({
    backgroundColor: colors.surfaceContainer.highest,
    width: size,
    height: size,
    borderRadius: CORNER.full,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  icon: {
    color: colors.onSurface,
  },
}));
