import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { useTheme } from '@util/theme/paper';
import { Text } from 'react-native-paper';
import { CombinedAccount } from '~/queries/account';
import { Balance } from '../Balance';
import { Card, CardProps } from '../card/Card';
import { CardItemSkeleton } from '../card/CardItemSkeleton';

export interface AccountCardProps extends CardProps {
  account: CombinedAccount;
}

export const AccountCard = withSkeleton(
  ({ account, ...cardProps }: AccountCardProps) => {
    const { colors } = useTheme();

    return (
      <Card p={3} backgroundColor={colors.tertiaryContainer} {...cardProps}>
        <Text variant="titleMedium">
          <Addr addr={account.contract.address} />
        </Text>

        <Box flexGrow={1} horizontal justifyContent="flex-end">
          <Text variant="bodyLarge">
            <Balance addr={account.contract.address} />
          </Text>
        </Box>
      </Card>
    );
  },
  CardItemSkeleton,
);
