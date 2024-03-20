import { ComponentPropsWithoutRef } from 'react';
import { Chip as Base } from 'react-native-paper';
import { useWithLoading } from '~/hooks/useWithLoading';

type BaseProps = ComponentPropsWithoutRef<typeof Base>;

export interface ChipProps extends BaseProps {}

export function Chip(props: ChipProps) {
  const [loading, onPress] = useWithLoading(props.onPress);

  return (
    <Base
      {...props}
      onPress={onPress}
      {...(loading && { disabled: true })}
    />
  );
}
