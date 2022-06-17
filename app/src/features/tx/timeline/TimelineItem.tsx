import { Box, BoxProps } from '@components/Box';
import { FC, ReactNode, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { TimelineConnector } from './TimelineConnector';
import { TimelineDot } from './TimelineDot';

export type TimelineItemStatus =
  | 'requires-action'
  | 'in-progress'
  | 'complete'
  | 'future';

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

  const [dotColor, connectorColor] = useMemo(() => {
    switch (status) {
      case 'requires-action':
        return [colors.primary, colors.onSurface];
      case 'in-progress':
        return [colors.primary, colors.primary];
      case 'complete':
        return [colors.success, colors.success];
      case 'future':
        return [colors.onSurface, colors.onSurface];
      default:
        throw new Error('Unhandled timeline item status');
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
            <RenderDot color={dotColor} />
          ) : (
            <TimelineDot color={dotColor} />
          )}
        </Box>

        {connector && (
          <TimelineConnector
            color={connectorColor}
            dotted={status === 'in-progress'}
          />
        )}
      </Box>

      <Box flex={1} horizontal justifyContent="flex-start">
        {Right}
      </Box>
    </Box>
  );
};
