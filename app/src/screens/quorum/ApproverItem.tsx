import { RemoveIcon } from '@theme/icons';
import { Address } from 'lib';
import { useAddrName } from '~/components/addr/useAddrName';
import { ListItem } from '~/components/ListItem/ListItem';

export interface ApproverItemProps {
  approver: Address;
  onRemove: () => void;
}

export const ApproverItem = ({ approver, onRemove }: ApproverItemProps) => {
  const name = useAddrName(approver);

  return (
    <ListItem
      leading={name}
      headline={name}
      trailing={(props) => <RemoveIcon {...props} onPress={onRemove} />}
    />
  );
};
