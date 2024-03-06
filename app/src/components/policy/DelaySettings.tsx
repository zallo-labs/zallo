import { SelectChip } from '#/fields/SelectChip';
import { ListItem } from '#/list/ListItem';
import { materialCommunityIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { Duration } from 'luxon';
import { Divider } from 'react-native-paper';
import { usePolicyDraft } from '~/lib/policy/draft';

export const DELAY_ENTRIES = [
  { title: 'None', value: 0 },
  { title: '1 hour', value: Duration.fromObject({ hours: 1 }).as('seconds') },
  { title: '12 hours', value: Duration.fromObject({ hours: 12 }).as('seconds') },
  { title: '24 hours', value: Duration.fromObject({ hours: 24 }).as('seconds') },
  { title: '3 days', value: Duration.fromObject({ days: 3 }).as('seconds') },
  { title: '7 days', value: Duration.fromObject({ days: 7 }).as('seconds') },
  { title: '14 days', value: Duration.fromObject({ days: 14 }).as('seconds') },
  { title: '28 days', value: Duration.fromObject({ days: 28 }).as('seconds') },
] as const;

const TimerIcon = materialCommunityIcon('timer-outline');

export function DelaySettings() {
  const [{ delay }, update] = usePolicyDraft();

  return (
    <>
      <ListItem
        leading={TimerIcon}
        headline="Delay"
        trailing={
          <SelectChip
            entries={DELAY_ENTRIES}
            value={delay}
            onChange={(delay) =>
              update((draft) => {
                draft.delay = delay;
              })
            }
          />
        }
      />
      <Divider leftInset style={styles.divider} />
    </>
  );
}

const styles = createStyles({
  divider: {
    marginVertical: 8,
  },
});
