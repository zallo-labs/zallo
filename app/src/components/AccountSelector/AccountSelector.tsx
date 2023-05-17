import { makeStyles } from '@theme/makeStyles';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { AddressLabel } from '../address/AddressLabel';
import { AddressIcon } from '../Identicon/AddressIcon';
import { useSelectedAccount } from './useSelectedAccount';
import { useNavigation } from '@react-navigation/native';
import { Suspense } from 'react';
import { LineSkeleton } from '../skeleton/LineSkeleton';

export const AccountSelector = () => {
  const styles = useStyles();
  const { navigate } = useNavigation();
  const account = useSelectedAccount();

  return (
    <TouchableOpacity style={styles.container} onPress={() => navigate('AccountsSheet')}>
      <AddressIcon address={account} size={styles.icon.fontSize} />

      <Suspense fallback={<LineSkeleton />}>
        <Text variant="titleLarge">
          <AddressLabel address={account} />
        </Text>
      </Suspense>
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
