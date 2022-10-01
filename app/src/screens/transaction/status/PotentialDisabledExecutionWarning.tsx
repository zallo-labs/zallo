import { makeStyles } from '@theme/makeStyles';
import { assert } from 'console';
import { Button, Text } from 'react-native-paper';
import { ActivateAccountButton } from '~/components/account/ActivateAccountButton';
import { Box } from '~/components/layout/Box';
import { useTxContext } from '../TransactionProvider';
import {
  ExecutionProhibition,
  useExecutionProhibited,
} from './useExecutionProhibited';

export const PotentialDisabledExecutionWarning = () => {
  const styles = useStyles();
  const { account } = useTxContext();
  const prohibition = useExecutionProhibited();

  if (!prohibition) return null;

  if (prohibition === ExecutionProhibition.InactiveAccount)
    return (
      <Box horizontal justifyContent="space-between" alignItems="center">
        <Text variant="titleLarge" style={styles.error}>
          Activate account to enable executions
        </Text>

        <Box>
          <ActivateAccountButton account={account}>
            {({ label, ...props }) => (
              <Button mode="contained" {...props}>
                {label}
              </Button>
            )}
          </ActivateAccountButton>
        </Box>
      </Box>
    );

  if (prohibition === ExecutionProhibition.InactiveUser)
    return (
      <Box vertical alignItems="center">
        <Text variant="titleLarge" style={styles.error}>
          Proposing user is inactive
        </Text>
        <Text variant="titleMedium" style={styles.error}>
          Active user or change proposer to allow execution
        </Text>
      </Box>
    );

  assert(prohibition === ExecutionProhibition.InsufficientBalance);
  return (
    <Text variant="titleLarge" style={styles.error}>
      Insufficient available balance
    </Text>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  error: {
    color: colors.error,
    textAlign: 'center',
    flex: 1,
  },
}));
