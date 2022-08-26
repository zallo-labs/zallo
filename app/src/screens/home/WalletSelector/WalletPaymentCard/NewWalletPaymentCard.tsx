import { Box } from '~/components/layout/Box';
import { PlusCircleIcon } from '~/util/theme/icons';
import { useTheme } from '@theme/paper';
import { Card, CardProps } from '~/components/card/Card';
import { WALLET_PAYMENT_CARD_STYLE } from './WalletPaymentCardSkeleton';
import { makeStyles } from '@theme/makeStyles';

export interface NewWalletPaymentCardProps extends CardProps {}

export const NewWalletPaymentCard = (props: NewWalletPaymentCardProps) => {
  const styles = useStyles();
  const { colors, iconSize } = useTheme();

  return (
    <Card style={styles.card} {...props}>
      <Box flex={1} vertical center>
        <PlusCircleIcon color={colors.tertiary} size={iconSize.medium} />
      </Box>
    </Card>
  );
};

const useStyles = makeStyles(({ colors, space }) => ({
  card: {
    ...WALLET_PAYMENT_CARD_STYLE,
    borderColor: colors.tertiary,
    borderWidth: space(1),
  },
}));
