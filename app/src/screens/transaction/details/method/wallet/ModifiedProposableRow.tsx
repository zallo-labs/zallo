import { AddIcon, DeleteIcon, ReplaceIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { FC } from 'react';
import { Box } from '~/components/layout/Box';
import { isActive, isProposed, Proposable } from '~/gql/proposable';

export interface ModifiedProposableRowProps<T> {
  proposable: Proposable<T>;
  children: FC<{ value: T }>;
}

export const ModifiedProposableRow = <T,>({
  proposable: p,
  children: C,
}: ModifiedProposableRowProps<T>) => {
  const styles = useStyles();

  if (!isProposed(p)) return null;

  if (!isActive(p)) {
    return (
      <Box horizontal alignItems="center">
        <AddIcon style={styles.icon} />
        <C value={p.proposed} />
      </Box>
    );
  }

  if (p.proposed === null) {
    return (
      <Box horizontal alignItems="center">
        <DeleteIcon style={styles.icon} />
        <C value={p.active} />
      </Box>
    );
  }

  // Replace
  return (
    <Box horizontal alignItems="center">
      <ReplaceIcon style={styles.icon} />

      <Box>
        <C value={p.active} />
        <C value={p.proposed} />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles(({ colors, space }) => ({
  icon: {
    color: colors.onSurface,
    marginRight: space(2),
  },
}));
