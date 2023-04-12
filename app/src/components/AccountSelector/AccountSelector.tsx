import { makeStyles } from '@theme/makeStyles';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRootNavigation2 } from '~/navigation/useRootNavigation';
import { AddressLabel } from '../address/AddressLabel';
import { AddressIcon } from '../Identicon/AddressIcon';
import { useSelectedAccountId } from './useSelectedAccount';

export const AccountSelector = () => {
  const styles = useStyles();
  const { navigate } = useRootNavigation2();
  const account = useSelectedAccountId();

  return (
    <TouchableOpacity style={styles.container} onPress={() => navigate('AccountsSheet')}>
      <AddressIcon address={account} size={styles.icon.fontSize} />

      <Text variant="titleLarge">
        <AddressLabel address={account} />
      </Text>
    </TouchableOpacity>
  );
};

const useStyles = makeStyles(({ iconSize }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: iconSize.small,
  },
}));
