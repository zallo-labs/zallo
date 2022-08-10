import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { PayIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { Text } from 'react-native-paper';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import { useTokenValues } from '~/token/useTokenValues';
import { Card, CardProps } from '../card/Card';
import { CardItemSkeleton } from '../card/CardItemSkeleton';

export const WALLET_CARD_HEIGHT = 160;

export interface WalletCardProps extends CardProps {
  id: WalletId;
  available?: boolean;
}

export const WalletCard = withSkeleton(
  ({ id, available, ...cardProps }: WalletCardProps) => {
    const wallet = useWallet(id);
    const { colors } = useTheme();
    const { totalFiatValue } = useTokenValues(wallet.accountAddr);

    const colorStyle = { color: colors.onTertiaryContainer };

    return (
      <Card
        p={3}
        height={WALLET_CARD_HEIGHT}
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
                <FiatValue value={totalFiatValue} /> available
              </Text>
            )}
          </Box>
        </Box>
      </Card>
    );
  },
  CardItemSkeleton,
);
