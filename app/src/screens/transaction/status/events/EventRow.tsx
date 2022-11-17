import { Box } from '~/components/layout/Box';
import { DateTime } from 'luxon';
import { FC, ReactNode } from 'react';
import { Text } from 'react-native-paper';
import { Timestamp } from '~/components/format/Timestamp';
import { Container } from '~/components/layout/Container';
import { StyleProp, TextStyle } from 'react-native';
import { makeStyles } from '@theme/makeStyles';

export interface EventRowProps {
  Icon: FC<{ style: StyleProp<TextStyle> }>;
  content: ReactNode;
  timestamp: DateTime;
}

export const EventRow = ({ Icon, content, timestamp }: EventRowProps) => {
  const styles = useStyles();

  return (
    <Box horizontal justifyContent="space-between" alignItems="center">
      <Container flexShrink={1} horizontal alignItems="center" separator={<Box ml={1} />} mr={4}>
        <Icon style={styles.content} />

        <Text variant="bodyMedium" style={styles.content}>
          {content}
        </Text>
      </Container>

      <Text variant="bodyMedium">
        <Timestamp timestamp={timestamp} />
      </Text>
    </Box>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  content: {
    color: colors.onSurface,
  },
}));
