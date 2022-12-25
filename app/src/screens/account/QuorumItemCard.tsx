import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Text, TouchableRipple } from 'react-native-paper';
import { CardItemSkeleton } from '../../components/card/CardItemSkeleton';
import { Box } from '~/components/layout/Box';
import { LabelIcon } from '~/components/Identicon/LabelIcon';
import { makeStyles } from '@theme/makeStyles';
import { memo } from 'react';
import { QuorumGuid } from 'lib';
import { useQuorum } from '~/queries/useQuorum.api';

export interface QuorumItemProps {
  quorum: QuorumGuid;
  onPress?: () => void;
}

export const QuorumItem = memo(({ quorum: id, onPress }: QuorumItemProps) => {
  const styles = useStyles();
  const quorum = useQuorum(id);

  return (
    <TouchableRipple onPress={onPress} style={styles.root}>
      <Box horizontal alignItems="center">
        <LabelIcon label={quorum.name ?? 'Q'} style={styles.icon} />

        <Box flex={1} vertical justifyContent="center">
          <Text variant="titleMedium">{quorum.name}</Text>
        </Box>
      </Box>
    </TouchableRipple>
  );
});

const useStyles = makeStyles(({ space }) => ({
  root: {
    padding: space(2),
  },
  icon: {
    marginRight: space(2),
  },
}));

export default withSkeleton(QuorumItem, CardItemSkeleton);
