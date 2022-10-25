import { RetryIcon } from '~/util/theme/icons';
import { useState } from 'react';
import { Button } from 'react-native-paper';
import { useExecute } from '~/mutations/proposal/execute/useExecute';
import { Actions } from './Actions';
import { useTxContext } from '../../TransactionProvider';

export const FailedActions = () => {
  const { proposal, proposer } = useTxContext();
  const execute = useExecute(proposer, proposal);

  const [submitting, setSubmitting] = useState(false);

  return (
    <Actions>
      <Button
        mode="contained"
        icon={RetryIcon}
        loading={submitting}
        onPress={() => {
          setSubmitting(true);
          execute();
          // Execute will cause a re-render once complete
        }}
      >
        Retry
      </Button>
    </Actions>
  );
};
