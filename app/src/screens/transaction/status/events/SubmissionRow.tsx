import { ErrorIcon, SendIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { Submission } from '~/queries/tx';
import { EventRow } from './EventRow';

export interface SubmissionRowProps {
  submission: Submission;
}

export const SubmissionRow = ({ submission }: SubmissionRowProps) => {
  const { colors } = useTheme();

  return (
    <EventRow
      Icon={
        submission.failed ? () => <ErrorIcon color={colors.error} /> : SendIcon
      }
      content={submission.failed ? 'Submission failed' : 'Submitted'}
      timestamp={submission.timestamp}
    />
  );
};
