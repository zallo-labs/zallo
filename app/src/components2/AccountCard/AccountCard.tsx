import { Addr } from '@components/Addr';
import { useTheme } from '@util/theme/paper';
import { Text } from 'react-native-paper';
import { Card } from '../card/Card';
import { AccountName } from './AccountName';
import { useSelectedAccount } from './useSelectedAccount';

export const AccountCard = () => {
  const { colors } = useTheme();
  const selected = useSelectedAccount();

  return (
    <Card backgroundColor={colors.tertiaryContainer} p={3} pb={5}>
      <Text variant="titleLarge" style={{ color: colors.onTertiaryContainer }}>
        <AccountName account={selected} />
      </Text>

      <Text variant="bodyMedium" style={{ color: colors.onTertiaryContainer }}>
        <Addr addr={selected.safe.safe.address} />
      </Text>
    </Card>
  );
};
