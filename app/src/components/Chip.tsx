import { IconProps } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { ComponentPropsWithoutRef, FC } from 'react';
import { Chip as Base } from 'react-native-paper';
import { useWithLoading } from '~/hooks/useWithLoading';

type BaseProps = ComponentPropsWithoutRef<typeof Base>;

export interface ChipProps extends Omit<BaseProps, 'icon'> {
  icon?: FC<IconProps>;
}

export function Chip({ icon: Icon, selected, ...props }: ChipProps) {
  const { styles } = useStyles(stylesheet);

  const [loading, onPress] = useWithLoading(props.onPress);

  return (
    <Base
      selected={selected}
      mode={selected ? 'flat' : 'outlined'}
      {...props}
      {...(Icon &&
        !selected && { icon: (props) => <Icon {...props} color={styles.unselectedIcon.color} /> })}
      onPress={onPress}
      {...(loading && { disabled: true })}
    />
  );
}

const stylesheet = createStyles(({ colors }) => ({
  unselectedIcon: {
    color: colors.onSurface,
  },
}));
