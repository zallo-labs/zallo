import { DateTime } from 'luxon';
import { useMemo } from 'react';

export interface TimestampProps {
  children: DateTime | number;
  weekday?: boolean;
  time?: boolean;
}

export const Timestamp = ({ children, weekday, time }: TimestampProps) => {
  const dt = useMemo(
    () =>
      typeof children === 'number' ? DateTime.fromSeconds(children) : children,
    [children],
  );

  const formatted = useMemo(
    () =>
      // dt.toFormat(`ccc d LLL${dt.year !== DateTime.now().year ? ' yy' : ''}`),
      dt.toLocaleString({
        ...(weekday && { weekday: 'short' }),
        month: 'short',
        day: 'numeric',
        year: dt.year !== DateTime.now().year ? '2-digit' : undefined,
        ...(time && {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }),
    [dt, weekday, time],
  );

  return <>{formatted}</>;
};
