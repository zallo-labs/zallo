import { SelectChip } from '#/fields/SelectChip';
import { ListItem } from '#/list/ListItem';
import { materialCommunityIcon } from '@theme/icons';
import { CORNER } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { Duration } from 'luxon';
import { usePolicyDraft } from '~/lib/policy/policyAsDraft';

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
  const { styles } = useStyles(stylesheet);
  const [{ delay }, update] = usePolicyDraft();

  return (
    <ListItem
      leading={TimerIcon}
      headline="Delay"
      supporting="Actions will be delayed before execution, and may be cancelled"
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
      containerStyle={styles.item}
    />
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surface,
    borderRadius: CORNER.l,
  },
}));
