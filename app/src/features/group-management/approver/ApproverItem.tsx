import { FormattedAddr } from '@components/FormattedAddr';
import { Identicon } from '@components/Identicon';
import { ListItem } from '@components/list/ListItem';
import { Approver } from 'lib';
import { Subheading } from 'react-native-paper';

export interface ApproverItemProps {
  approver: Approver;
}

export const ApproverItem = ({ approver }: ApproverItemProps) => {
  return (
    <ListItem
      Left={<Identicon seed={approver.addr} />}
      Main={
        <Subheading>
          <FormattedAddr addr={approver.addr} />
        </Subheading>
      }
    />
  );
};
