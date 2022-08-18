import { ErrorIcon, FinalizedIcon, SendIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { memo } from 'react';
import { Submission } from '~/queries/tx';
import { EventRow, EventRowProps } from './EventRow';

export interface SubmissionRowProps {
  submission: Submission;
}

export const SubmissionRow = memo(({ submission }: SubmissionRowProps) => {
  const { colors } = useTheme();

  const [content, Icon] = ((): [string, EventRowProps['Icon']] => {
    switch (submission.status) {
      case 'pending':
        return ['Submitted', SendIcon];
      case 'success':
        return ['Executed', FinalizedIcon];
      case 'failure':
        return ['Submission Failed', () => <ErrorIcon color={colors.error} />];
    }
  })();

  return (
    <EventRow Icon={Icon} content={content} timestamp={submission.timestamp} />
  );
});
