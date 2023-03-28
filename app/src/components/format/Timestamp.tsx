import { DateTime } from 'luxon';
import { useMemo } from 'react';

export interface UseTimestampOptions {
  timestamp: DateTime;
  weekday?: boolean;
  time?: boolean;
}

export const useTimestamp = ({ timestamp, weekday, time = true }: TimestampProps) =>
  useMemo(
    () =>
      timestamp.toLocaleString({
        year: timestamp.year !== DateTime.now().year ? '2-digit' : undefined,
        month: 'short',
        day: 'numeric',
        ...(weekday && { weekday: 'short' }),
        ...(time && {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }),
    [timestamp, weekday, time],
  );

export interface TimestampProps extends UseTimestampOptions {}

export const Timestamp = (props: TimestampProps) => <>{useTimestamp(props)}</>;
