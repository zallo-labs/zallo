import { DateTime } from 'luxon';
import { useMemo } from 'react';

export const asDateTime = (timestamp: DateTime | string) =>
  typeof timestamp === 'string' ? DateTime.fromISO(timestamp) : timestamp;

export interface UseTimestampOptions {
  timestamp: DateTime | string;
  weekday?: boolean;
  time?: boolean;
}

export const useTimestamp = ({ timestamp, weekday, time = true }: TimestampProps) =>
  useMemo(() => {
    const ts = asDateTime(timestamp);

    return ts.toLocaleString({
      year: ts.year !== DateTime.now().year ? '2-digit' : undefined,
      month: 'short',
      day: 'numeric',
      ...(weekday && { weekday: 'short' }),
      ...(time && {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  }, [timestamp, weekday, time]);

export interface TimestampProps extends UseTimestampOptions {}

export const Timestamp = (props: TimestampProps) => <>{useTimestamp(props)}</>;
