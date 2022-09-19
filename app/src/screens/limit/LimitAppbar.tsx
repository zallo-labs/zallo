import { DeleteIcon } from '@theme/icons';
import { Appbar } from 'react-native-paper';
import { useGoBack } from '~/components/Appbar/useGoBack';

export interface LimitAppbarProps {
  remove: () => void;
}

export const LimitAppbar = ({ remove }: LimitAppbarProps) => {
  return (
    <Appbar.Header mode="large">
      <Appbar.BackAction onPress={useGoBack()} />

      <Appbar.Content title="Spending limit" />

      <Appbar.Action icon={DeleteIcon} onPress={remove} />
    </Appbar.Header>
  );
};
