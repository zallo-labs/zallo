import { AddItem } from '@components/list/AddItem';
import { ItemsContainer } from '@components/list/ItemsContainer';
import { Group } from '@queries';
import { ApproverItem } from './ApproverItem';

export interface ApproverItemsProps {
  group: Group;
}

export const ApproverItems = ({ group }: ApproverItemsProps) => {
  return (
    <ItemsContainer>
      {group.approvers.map((approver) => (
        <ApproverItem key={approver.addr} approver={approver} />
      ))}

      <AddItem />
    </ItemsContainer>
  );
};
