import { makeStyles } from '@theme/makeStyles';
import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { useAccount } from '~/queries/account/useAccount';

export interface InactiveIndicatorProps {
  accountAddr: Address;
}

export const InactiveIndicator = ({ accountAddr }: InactiveIndicatorProps) => {
  const styles = useStyles();
  const { account } = useAccount(accountAddr);

  if (!account || account.active) return null;

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
