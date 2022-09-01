import { makeStyles } from '@theme/makeStyles';
import { Button, Text } from 'react-native-paper';
import { ActivateAccountButton } from '~/components/account/ActivateAccountButton';
import { Box } from '~/components/layout/Box';
import { useTxContext } from '../TransactionProvider';

export const PotentialDisabledExecutionWarning = () => {
  const styles = useStyles();
  const { wallet, account } = useTxContext();

  if (!account.active)
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

  if (wallet.state.status !== 'add') return null;

  return (
    <Box vertical alignItems="center">
      <Text variant="titleLarge" style={styles.error}>
        Selected wallet is inactive
      </Text>
      <Text variant="titleMedium" style={styles.error}>
        Active or select another to allow execution
      </Text>
    </Box>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  error: {
    color: colors.error,
    textAlign: 'center',
    flex: 1,
  },
}));
