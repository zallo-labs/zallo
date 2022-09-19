import { makeStyles } from '@theme/makeStyles';
import { useTotalBalanceValue } from '@token/useTotalBalanceValue';
import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { Addr } from '~/components/addr/Addr';
import { Card, CardProps } from '~/components/card/Card';
import { CardItemSkeleton } from '~/components/card/CardItemSkeleton';
import { FiatValue } from '~/components/fiat/FiatValue';
import { Identicon } from '~/components/Identicon/Identicon';
import { Box } from '~/components/layout/Box';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useAccount } from '~/queries/account/useAccount.api';

export interface AccountItemProps extends CardProps {
  id: Address;
}

const AccountItem = ({ id, ...cardProps }: AccountItemProps) => {
  const styles = useStyles();
  const [account] = useAccount(id);

  return (
    <Card {...cardProps}>
      <Box horizontal justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Text variant="titleLarge">{account.name}</Text>
          <Text variant="bodySmall">
            <Addr addr={account.addr} mode="ens-or-short-addr" />
          </Text>
        </Box>

        <Identicon seed={account.addr} />
      </Box>

      <Box style={styles.row}>
        <Text variant="bodyLarge">Available</Text>
        <Text variant="titleMedium">
          {/* TODO: replace with useTotalAvailable */}
          <FiatValue value={useTotalBalanceValue(account.addr)} />
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

const useStyles = makeStyles(({ space }) => ({
  icon: {
    marginRight: space(2),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

export default withSkeleton(AccountItem, CardItemSkeleton);
