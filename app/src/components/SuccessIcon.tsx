import { materialIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ComponentPropsWithoutRef } from 'react';

const BaseIcon = materialIcon('check-circle-outline');

export interface SuccessIconProps extends ComponentPropsWithoutRef<typeof BaseIcon> {}

export function SuccessIcon(props: SuccessIconProps) {
  const styles = useStyles();

  return <BaseIcon {...props} style={[styles.icon, props.style]} />;
}

const useStyles = makeStyles(({ colors }) => ({
  icon: {
    color: colors.success,
  },
}));
