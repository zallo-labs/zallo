import { useIsDeployed } from '@network/useIsDeployed';
import { makeStyles } from '@theme/makeStyles';
import { Address } from 'lib';
import { Text } from 'react-native-paper';

export interface InactiveIndicatorProps {
  account: Address;
}

export const InactiveIndicator = ({ account }: InactiveIndicatorProps) => {
  const styles = useStyles();
  const isDeployed = useIsDeployed(account);

  if (isDeployed) return null;

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
