import { createStyles } from '@theme/styles';
import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { View } from 'react-native';
import { IconButton as Base } from 'react-native-paper';

type BaseProps = ComponentPropsWithoutRef<typeof Base>;

export interface IconButtonProps extends BaseProps {}

export const IconButton = forwardRef<View, IconButtonProps>((props, ref) => (
  <Base ref={ref} {...props} style={[styles.container, props.style]} />
));

const styles = createStyles({
  container: {
    margin: 0,
  },
});
