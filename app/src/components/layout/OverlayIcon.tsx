import { FilledIcon } from '#/FilledIcon';
import { IconProps } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { createStyles } from '@theme/styles';
import { FC } from 'react';

export interface OverlayIconProps {
  icon: FC<IconProps>;
  parentSize?: number;
}

export function OverlayIcon({ icon, parentSize = ICON_SIZE.medium }: OverlayIconProps) {
  return (
    <FilledIcon icon={icon} size={(parentSize * 10) / 24} style={styles.overlayed(parentSize)} />
  );
}

const styles = createStyles({
  overlayed: (parentSize: number) => ({
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginTop: -parentSize,
  }),
});
