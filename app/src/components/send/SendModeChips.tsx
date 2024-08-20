import { Chip } from '#/Chip';
import { Scrollable } from '#/Scrollable';
import { CheckAllIcon, ContactsOutlineIcon, DataIcon, OutboundIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';

export type SendMode = 'transfer'; // | 'transferFrom' | 'approve' | 'data';

export interface SendModeChipsProps {
  mode: SendMode;
  onChange: (mode: SendMode) => void;
}

export function SendModeChips({ mode, onChange }: SendModeChipsProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <Scrollable horizontal contentContainerStyle={styles.container}>
      <Chip icon={OutboundIcon} selected={mode === 'transfer'} onPress={() => onChange('transfer')}>
        Transfer
      </Chip>

      {/* <Chip icon={CheckAllIcon} selected={mode === 'approve'} onPress={() => onChange('approve')}>
        Approve spending
      </Chip> */}

      {/* <Chip
        icon={ContactsOutlineIcon}
        selected={mode === 'transferFrom'}
        onPress={() => onChange('transferFrom')}
      >
        Transfer from
      </Chip> */}

      {/* <Chip icon={DataIcon} selected={mode === 'data'} onPress={() => onChange('data')}>
        Data
      </Chip> */}
    </Scrollable>
  );
}

const stylesheet = createStyles(({ colors, padding }) => ({
  container: {
    gap: 8,
    paddingHorizontal: padding,
  },
}));
