import { Box } from '~/components/layout/Box';
import { PlusCircleIcon } from '~/util/theme/icons';
import { useTheme } from '@theme/paper';
import { Card, CardProps } from '~/components/card/Card';
import { WALLET_PAYMENT_CARD_HEIGHT } from './WalletPaymentCardSkeleton';

export interface NewWalletPaymentCardProps extends CardProps {}

export const NewWalletPaymentCard = (props: NewWalletPaymentCardProps) => {
  const { colors, iconSize } = useTheme();

  return (
    <Card
      height={WALLET_PAYMENT_CARD_HEIGHT}
      borderColor={colors.tertiary}
      borderWidth={1}
      {...props}
    >
      <Box flex={1} vertical center>
        <PlusCircleIcon color={colors.tertiary} size={iconSize.medium} />
      </Box>
    </Card>
  );
};
