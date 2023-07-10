import { makeStyles } from '@theme/makeStyles';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { AddressLabel } from '../address/AddressLabel';
import { AddressIcon } from '../Identicon/AddressIcon';
import { useNavigation } from '@react-navigation/native';
import { Suspense } from 'react';
import { LineSkeleton } from '../skeleton/LineSkeleton';
import { Address } from 'lib';
import { Chevron } from '../Chevron';

export interface AccountSelectorParams {
  account: Address;
}

export const AccountSelector = ({ account }: AccountSelectorParams) => {
  const styles = useStyles();
  const { navigate } = useNavigation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigate('AccountsSheet', { account })}
    >
      <AddressIcon address={account} size={styles.icon.fontSize} />

      <Suspense fallback={<LineSkeleton />}>
        <Text variant="titleLarge" style={styles.text}>
          <AddressLabel address={account} />
        </Text>
      </Suspense>

      <Chevron style={styles.text} />
    </TouchableOpacity>
  );
};

const useStyles = makeStyles(({ colors, iconSize }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: iconSize.small,
  },
  text: {
    color: colors.onSurfaceVariant,
  },
}));
