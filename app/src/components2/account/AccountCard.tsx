import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { useTheme } from '@util/theme/paper';
import { Text } from 'react-native-paper';
import { CombinedAccount } from '~/queries/accounts';
import { Balance } from '../Balance';
import { Card, CardProps } from '../card/Card';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { AccountName } from './AccountName';

export interface AccountCardProps extends CardProps {
  account: CombinedAccount;
  balance?: boolean;
  large?: boolean;
}

export const AccountCard = withSkeleton(
  ({
    account,
    balance = true,
    large = false,
    ...cardProps
  }: AccountCardProps) => {
    const { onBackground } = useTheme();

    const textStyle = {
      color: onBackground(cardProps?.backgroundColor),
    };

    return (
      <Card p={3} {...cardProps} {...(large && { minHeight: 120 })}>
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
                <Balance addr={account.safeAddr} />
              </Text>
            </Box>
          )}
        </Box>
      </Card>
    );
  },
  CardItemSkeleton,
);
