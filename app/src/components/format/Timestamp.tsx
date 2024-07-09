import { DateTime } from 'luxon';

export const asDateTime = (timestamp: DateTime | string) =>
  typeof timestamp === 'string' ? DateTime.fromISO(timestamp) : timestamp;

export interface UseTimestampOptions {
  timestamp: DateTime | string;
  weekday?: boolean;
  time?: boolean;
}

export function useTimestamp({ timestamp, weekday, time = true }: TimestampProps) {
  const ts = asDateTime(timestamp);

  return ts.toLocaleString({
    year: ts.year !== DateTime.now().year ? '2-digit' : undefined,
    month: 'short',
    day: 'numeric',
    ...(weekday && { weekday: 'short' }),
    ...(time && {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  });
}

export interface TimestampProps extends UseTimestampOptions {}

export const Timestamp = (props: TimestampProps) => <>{useTimestamp(props)}</>;
