import { ComponentPropsWithoutRef } from 'react';

import { materialIcon } from '~/util/theme/icons';
import { createStyles, useStyles } from '~/util/theme/styles';

const BaseIcon = materialIcon('check-circle-outline');

export interface SuccessIconProps extends ComponentPropsWithoutRef<typeof BaseIcon> {}

export function SuccessIcon(props: SuccessIconProps) {
  const { styles } = useStyles(stylesheet);

  return <BaseIcon {...props} style={[styles.icon, props.style]} />;
}

const stylesheet = createStyles(({ colors }) => ({
  icon: {
    color: colors.success,
  },
}));
