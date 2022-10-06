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
import { Item } from '../item/Item';

export interface AccountItemCardProps extends CardProps {
  id: UserId;
  showAvailable?: boolean;
}

const AccountItemCard = ({
  id,
  showAvailable,
  ...cardProps
}: AccountItemCardProps) => {
  const styles = useStyles();
  const [user] = useUser(id);
  const [account] = useAccount(id.account);
  const available = useTotalAvailableValue(user);
  const balance = useTotalBalanceValue(account.addr);

  return (
    <Card {...cardProps}>
      <Item
        Left={<Identicon seed={account.addr} />}
        Main={[
          <Text variant="titleLarge">{account.name}</Text>,
          <Text variant="bodyMedium">{user.name}</Text>,
        ]}
      />

      {showAvailable && (
        <>
          <Box mt={1} style={styles.row}>
            <Text variant="bodyLarge">Available</Text>
            <Text variant="titleMedium">
              <FiatValue value={available} />
            </Text>
          </Box>

          <Box style={styles.row}>
            <Text variant="bodyLarge">Balance</Text>
            <Text variant="bodyLarge">
              <FiatValue value={balance} />
            </Text>
          </Box>
        </>
      )}
    </Card>
  );
};

const useStyles = makeStyles(() => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

export default withSkeleton(AccountItemCard, CardItemSkeleton);
