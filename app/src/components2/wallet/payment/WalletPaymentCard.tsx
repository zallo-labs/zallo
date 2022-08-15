import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { PayIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { Text } from 'react-native-paper';
import { Card, CardProps } from '~/components2/card/Card';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import {
  WalletPaymentCardSkeleton,
  WALLET_PAYMENT_CARD_HEIGHT,
} from './WalletPaymentCardSkeleton';
import { FiatBalance } from '~/components2/fiat/FiatBalance';
import { Suspend } from '@components/Suspender';

export interface WalletPaymentCardProps extends CardProps {
  id: WalletId;
  available?: boolean;
}

export const WalletPaymentCard = withSkeleton(
  ({ id, available, ...cardProps }: WalletPaymentCardProps) => {
    const wallet = useWallet(id);
    const { colors } = useTheme();

    const colorStyle = { color: colors.onTertiaryContainer };

    if (!wallet) return <Suspend />;

    return (
      <Card
        p={3}
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

          <Box horizontal justifyContent="flex-end">
            {available && (
              <Text variant="bodyLarge" style={colorStyle}>
                <FiatBalance
                  addr={wallet.accountAddr}
                  rightAffix=" available"
                  showZero
                />
              </Text>
            )}
          </Box>
        </Box>
      </Card>
    );
  },
  WalletPaymentCardSkeleton,
);
