import { Addr } from '~/components/addr/Addr';
import { Box } from '~/components/layout/Box';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { PayIcon } from '~/util/theme/icons';
import { useTheme } from '@theme/paper';
import { Text } from 'react-native-paper';
import { Card, CardProps } from '~/components/card/Card';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import {
  WalletPaymentCardSkeleton,
  WALLET_PAYMENT_CARD_HEIGHT,
} from './WalletPaymentCardSkeleton';
import { Suspend } from '~/components/Suspender';
import { useSelectedToken } from '~/components/token/useSelectedToken';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenValue } from '@token/useTokenValue';
import { FiatValue } from '~/components/fiat/FiatValue';

export interface WalletPaymentCardProps extends CardProps {
  id: WalletId;
  available?: boolean;
}

export const WalletPaymentCard = withSkeleton(
  ({ id, available, ...cardProps }: WalletPaymentCardProps) => {
    const wallet = useWallet(id);
    const { colors } = useTheme();
    const token = useSelectedToken();
    const { fiatValue } = useTokenValue(token, useTokenBalance(token, wallet));

    const colorStyle = { color: colors.onTertiaryContainer };

    if (!wallet) return <Suspend />;

    return (
      <Card
        height={WALLET_PAYMENT_CARD_HEIGHT}
        backgroundColor={colors.tertiaryContainer}
        {...cardProps}
      >
        <Box flex={1} vertical justifyContent="space-between">
          <Box horizontal justifyContent="space-between" alignItems="center">
            <Box vertical justifyContent="space-around">
              <Text variant="titleLarge" style={colorStyle}>
                {wallet.name}
              </Text>

              <Text variant="bodyMedium" style={colorStyle}>
                <Addr addr={wallet.accountAddr} />
              </Text>
            </Box>

            <PayIcon size={32} {...colorStyle} />
          </Box>

          {available && (
            <Box horizontal justifyContent="space-between">
              <Text variant="bodyLarge" style={colorStyle}>
                {token.symbol}
              </Text>

              <Text variant="bodyLarge" style={colorStyle}>
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
