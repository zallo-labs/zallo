import { Box, BoxProps } from '@components/Box';
import { FC, ReactNode, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { TimelineConnector } from './TimelineConnector';
import { TimelineDot } from './TimelineDot';

export type TimelineItemStatus = 'current' | 'future' | 'done';

export interface TimelineItemProps extends BoxProps {
  Left?: ReactNode;
  Right?: ReactNode;
  status: TimelineItemStatus;
  connector?: boolean;
  renderDot?: FC<{ color: string }>;
}

export const TimelineItem = ({
  Left,
  Right,
  status,
  connector,
  renderDot: RenderDot,
  ...boxProps
}: TimelineItemProps) => {
  const { colors } = useTheme();

  const color = useMemo(() => {
    switch (status) {
      case 'done':
        return colors.success;
      case 'current':
        return colors.primary;
      case 'future':
        return colors.text;
    }
  }, [status, colors]);

  return (
    <Box horizontal {...boxProps} alignItems="baseline">
      <Box flex={1} horizontal justifyContent="flex-end">
        {Left}
      </Box>

      <Box vertical alignItems="center" mx={3}>
        <Box my={2}>
          {RenderDot ? (
            <RenderDot color={color} />
          ) : (
            <TimelineDot color={color} />
          )}
        </Box>

        {connector && (
          <TimelineConnector color={color} dotted={status === 'current'} />
        )}
      </Box>

      <Box flex={1} horizontal justifyContent="flex-start">
        {Right}
      </Box>
    </Box>
  );
};
