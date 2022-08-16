import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { Timestamp } from '@components/Timestamp';
import { IconColor } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { DateTime } from 'luxon';
import { FC, ReactNode } from 'react';
import { Text } from 'react-native-paper';

export interface EventRowProps {
  Icon: FC<{ color: IconColor }>;
  content: ReactNode;
  timestamp: DateTime;
}

export const EventRow = ({ Icon, content, timestamp }: EventRowProps) => {
  const { colors } = useTheme();

  return (
    <Box horizontal justifyContent="space-between" alignItems="center">
      <Container
        flexShrink={1}
        horizontal
        alignItems="center"
        separator={<Box mx={1} />}
        mr={4}
      >
        <Icon color={colors.onSurface} />

        <Text variant="bodyMedium">{content}</Text>
      </Container>

      <Text variant="bodyMedium">
        <Timestamp time>{timestamp}</Timestamp>
      </Text>
    </Box>
  );
};
