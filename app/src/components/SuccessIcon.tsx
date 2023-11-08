import { materialIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { ComponentPropsWithoutRef } from 'react';

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
