import { makeStyles } from '@theme/makeStyles';
import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { useAccount } from '~/queries/account/useAccount.api';

export interface InactiveIndicatorProps {
  id: Address;
}

export const InactiveIndicator = ({ id }: InactiveIndicatorProps) => {
  const styles = useStyles();
  const [account] = useAccount(id);

  if (!account.active) return null;

  return (
    <Text variant="titleMedium" style={styles.inactive}>
      Inactive
    </Text>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  inactive: {
    color: colors.error,
  },
}));
