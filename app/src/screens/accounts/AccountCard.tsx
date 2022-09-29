import { makeStyles } from '@theme/makeStyles';
import { useTotalAvailableValue } from '@token/useTotalAvailableValue';
import { useTotalBalanceValue } from '@token/useTotalBalanceValue';
import { UserId } from 'lib';
import { Text } from 'react-native-paper';
import { Card, CardProps } from '~/components/card/Card';
import { CardItemSkeleton } from '~/components/card/CardItemSkeleton';
import { FiatValue } from '~/components/fiat/FiatValue';
import { Identicon } from '~/components/Identicon/Identicon';
import { Box } from '~/components/layout/Box';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useAccount } from '~/queries/account/useAccount.api';
import { useUser } from '~/queries/user/useUser.api';

export interface AccountCardProps extends CardProps {
  id: UserId;
}

const AccountCard = ({ id, ...cardProps }: AccountCardProps) => {
  const styles = useStyles();
  const [user] = useUser(id);
  const [account] = useAccount(id.account);

  return (
    <Card {...cardProps}>
      <Box horizontal justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Text variant="titleLarge">{account.name}</Text>
          <Text variant="bodyMedium">{user.name}</Text>
        </Box>

        <Identicon seed={account.addr} />
      </Box>

      <Box style={styles.row}>
        <Text variant="bodyLarge">Available</Text>
        <Text variant="titleMedium">
          <FiatValue value={useTotalAvailableValue(user)} />
        </Text>
      </Box>

      <Box style={styles.row}>
        <Text variant="bodyLarge">Balance</Text>
        <Text variant="bodyLarge">
          <FiatValue value={useTotalBalanceValue(account.addr)} />
        </Text>
      </Box>
    </Card>
  );
};

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

export default withSkeleton(AccountCard, CardItemSkeleton);
