import { DateTime } from 'luxon';
import { useMemo } from 'react';

export interface TimestampProps {
  timestamp: DateTime;
  weekday?: boolean;
  time?: boolean;
}

export const Timestamp = ({
  timestamp: timestamp,
  weekday,
  time = true,
}: TimestampProps) => {
  const formatted = useMemo(
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

  return <>{formatted}</>;
};
