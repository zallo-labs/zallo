import { ErrorIcon, FinalizedIcon, SendIcon } from '~/util/theme/icons';
import { useTheme } from '@theme/paper';
import { memo } from 'react';
import { Submission, SubmissionStatus } from '~/queries/proposal';
import { EventRow, EventRowProps } from './EventRow';
import { match } from 'ts-pattern';

export interface SubmissionRowProps {
  submission: Submission;
}

export const SubmissionRow = memo(({ submission }: SubmissionRowProps) => {
  const { colors } = useTheme();

  const [content, Icon] = match<
    SubmissionStatus,
    [string, EventRowProps['Icon']]
  >(submission.status)
    .with('pending', () => ['Submitted', SendIcon])
    .with('success', () => ['Executed', FinalizedIcon])
    .with('failure', () => [
      'Submission Failed',
      () => <ErrorIcon color={colors.error} />,
    ])
    .exhaustive();

  return (
    <EventRow Icon={Icon} content={content} timestamp={submission.timestamp} />
  );
});
