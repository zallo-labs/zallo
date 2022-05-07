import { ItemsContainer } from '@components/ItemsContainer';
import { useSafe } from '@features/safe/SafeProvider';
import { GroupItem } from './GroupItem';

export const GroupItems = () => {
  const { groups } = useSafe();

  return (
    <ItemsContainer>
      {groups.map((group) => (
        <GroupItem key={group.id} group={group} />
      ))}
    </ItemsContainer>
  );
};
