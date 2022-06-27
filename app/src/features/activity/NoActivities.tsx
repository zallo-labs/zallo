import { EmptyListFallback } from '@components/EmptyListFallback';
import { PRIMARY_ICON_SIZE } from '@components/list/Item';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const NoActivites = () => (
  <EmptyListFallback
    Icon={
      <MaterialCommunityIcons
        name="timer-sand-empty"
        color="white"
        size={PRIMARY_ICON_SIZE}
      />
    }
    title="No activites to show"
    subtitle="Check back later!"
  />
);
