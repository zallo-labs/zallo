import { Addr } from '~/components/addr/Addr';
import { Box } from '~/components/layout/Box';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { PayIcon } from '~/util/theme/icons';
import { Text } from 'react-native-paper';
import { Card, CardProps } from '~/components/card/Card';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallet/useWallet';
import {
  WalletPaymentCardSkeleton,
  WALLET_PAYMENT_CARD_STYLE,
} from './WalletPaymentCardSkeleton';
import { Suspend } from '~/components/Suspender';
import { useSelectedToken } from '~/components/token/useSelectedToken';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenValue } from '@token/useTokenValue';
import { FiatValue } from '~/components/fiat/FiatValue';
import { makeStyles } from '@theme/makeStyles';

export interface WalletPaymentCardProps extends CardProps {
  id: WalletId;
  available?: boolean;
}

export const WalletPaymentCard = withSkeleton(
  ({ id, available, ...cardProps }: WalletPaymentCardProps) => {
    const styles = useStyles();
    const wallet = useWallet(id);
    const token = useSelectedToken();
    const { fiatValue } = useTokenValue(token, useTokenBalance(token, wallet));

    if (!wallet) return <Suspend />;

    return (
      <Card elevation={2} style={styles.card} {...cardProps}>
        <Box flex={1} vertical justifyContent="space-between">
          <Box horizontal justifyContent="space-between" alignItems="center">
            <Box vertical justifyContent="space-around">
              <Text variant="titleLarge">{wallet.name}</Text>

              <Text variant="bodyMedium">
                <Addr addr={wallet.accountAddr} />
              </Text>
            </Box>

            <PayIcon size={32} color={styles.icon.color} />
          </Box>

          {available && (
            <Box horizontal justifyContent="space-between">
              <Text variant="bodyLarge">{token.symbol}</Text>

              <Text variant="bodyLarge">
                <FiatValue value={fiatValue} /> available
              </Text>
            </Box>
          )}
        </Box>
      </Card>
    );
  },
  WalletPaymentCardSkeleton,
);

const useStyles = makeStyles(({ colors }) => {
  return {
    card: WALLET_PAYMENT_CARD_STYLE,
    icon: {
      color: colors.onSurface,
    },
  };
});
