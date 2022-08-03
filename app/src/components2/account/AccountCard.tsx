import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { useTheme } from '@util/theme/paper';
import { Text } from 'react-native-paper';
import { CombinedAccount } from '~/queries/accounts';
import { Card, CardProps } from '../card/Card';
import { AccountName } from './AccountName';

export interface AccountCardProps {
  account: CombinedAccount;
  balance?: boolean;
  cardProps?: CardProps;
  large?: boolean;
}

export const AccountCard = ({
  account,
  balance = true,
  cardProps,
  large = false,
}: AccountCardProps) => {
  const { onBackground } = useTheme();

  const textStyle = {
    color: onBackground(cardProps?.backgroundColor),
  };

  return (
    <Card vertical p={3} {...cardProps} {...(large && { minHeight: 120 })}>
      <Text variant={`title${large ? 'Large' : 'Medium'}`} style={textStyle}>
        <AccountName account={account} />
      </Text>

      <Box flexGrow={1} horizontal>
        <Text style={[textStyle, { flexGrow: 1 }]} variant="bodyMedium">
          <Addr addr={account.safeAddr} />
        </Text>

        {balance && (
          <Box vertical justifyContent="flex-end">
            <Text style={textStyle} variant="bodyLarge">
              $xxx,xxx
            </Text>
          </Box>
        )}
      </Box>
    </Card>
  );
};
