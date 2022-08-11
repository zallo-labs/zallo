import { Box } from '@components/Box';
import { PlusCircleIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { Card, CardProps } from '~/components2/card/Card';
import { WALLET_PAYMENT_CARD_HEIGHT } from './WalletPaymentCardSkeleton';

export interface NewWalletPaymentCardProps extends CardProps {}

export const NewWalletPaymentCard = (props: NewWalletPaymentCardProps) => {
  const { colors, iconSize } = useTheme();

  return (
    <Card height={WALLET_PAYMENT_CARD_HEIGHT} {...props}>
      <Box flex={1} vertical center>
        <PlusCircleIcon color={colors.primary} size={iconSize.medium} style={{ opacity: 0.8 }} />
      </Box>
    </Card>
  );
};
