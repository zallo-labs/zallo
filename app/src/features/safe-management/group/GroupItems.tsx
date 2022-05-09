import { ItemsContainer } from '@components/list/ItemsContainer';
import { useSafe } from '@features/safe/SafeProvider';
import { GroupItem } from './GroupItem';
import { AddItem } from '@components/list/AddItem';

export const GroupItems = () => {
  const { groups } = useSafe();

  return (
    <ItemsContainer>
      {groups.map((group) => (
        <GroupItem key={group.id} group={group} />
      ))}

      <AddItem />
    </ItemsContainer>
  );
};
