import { Addr } from '~/components/addr/Addr';
import { Box } from '~/components/layout/Box';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Text } from 'react-native-paper';
import { Card, CardProps } from '~/components/card/Card';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallet/useWallet';
import {
  WalletCardSkeleton,
  WALLET_CARD_STYLE,
} from './WalletPaymentCardSkeleton';
import { Suspend } from '~/components/Suspender';
import { useSelectedToken } from '~/components/token/useSelectedToken';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenValue } from '@token/useTokenValue';
import { FiatValue } from '~/components/fiat/FiatValue';
import { makeStyles } from '@theme/makeStyles';
import MastercardLogo from '~/../assets/mastercard.svg';

export interface WalletCardProps extends CardProps {
  id: WalletId;
  available?: boolean;
}

export const WalletCard = withSkeleton(
  ({ id, available, ...cardProps }: WalletCardProps) => {
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

            <MastercardLogo width={48} height={48} />
          </Box>

          {available && (
            <Box
              horizontal
              justifyContent="space-between"
              alignItems="baseline"
            >
              <Text variant="bodyLarge">{token.symbol}</Text>

              <Text variant="titleMedium">
                <FiatValue value={fiatValue} />
              </Text>
            </Box>
          )}
        </Box>
      </Card>
    );
  },
  WalletCardSkeleton,
);

const useStyles = makeStyles(({ colors }) => ({
  card: WALLET_CARD_STYLE,
  icon: {
    color: colors.onSurface,
  },
  caption: {
    color: colors.onSurfaceOpaque,
  },
}));
