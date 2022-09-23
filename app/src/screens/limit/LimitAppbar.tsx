import { DeleteIcon } from '@theme/icons';
import { Appbar } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';

export interface LimitAppbarProps {
  onDelete?: () => void;
}

export const LimitAppbar = ({ onDelete }: LimitAppbarProps) => {
  return (
    <Appbar.Header>
      <AppbarBack />
      <Appbar.Content title="limit" />
      {onDelete && <Appbar.Action icon={DeleteIcon} onPress={onDelete} />}
    </Appbar.Header>
  );
};
