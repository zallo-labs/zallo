import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@util/theme/paper';
import { Text } from 'react-native-paper';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { Card } from '../card/Card';
import { AccountName } from './AccountName';
import { useSelectedAccount } from './useSelectedAccount';

export interface AccountCardProps {
  large?: boolean;
  balance?: boolean;
}

export const AccountCard = ({ large, balance = true }: AccountCardProps) => {
  const navigation = useNavigation<BottomNavigatorProps['navigation']>();
  const { colors } = useTheme();
  const selected = useSelectedAccount();

  return (
    <Card
      vertical
      backgroundColor={colors.tertiaryContainer}
      p={3}
      {...(large && { minHeight: 120 })}
      onPress={() => navigation.push('SelectAccount')}
    >
      <Text
        variant={`title${large ? 'Large' : 'Medium'}`}
        style={{ color: colors.onTertiaryContainer }}
      >
        <AccountName account={selected} />
      </Text>

      <Box flexGrow={1} horizontal>
        <Text
          variant="bodyMedium"
          style={{ flex: 1, color: colors.onTertiaryContainer }}
        >
          <Addr addr={selected.safe.safe.address} />
        </Text>

        {balance && (
          <Box vertical justifyContent="flex-end">
            <Text
              variant="bodyLarge"
              style={{ color: colors.onTertiaryContainer }}
            >
              $xxx,xxx
            </Text>
          </Box>
        )}
      </Box>
    </Card>
  );
};
