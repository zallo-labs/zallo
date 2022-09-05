import { Box } from '~/components/layout/Box';
import { PlusIcon } from '~/util/theme/icons';
import { WALLET_PAYMENT_CARD_STYLE } from './WalletPaymentCardSkeleton';
import { makeStyles } from '@theme/makeStyles';
import { IconButton } from 'react-native-paper';

export interface NewWalletPaymentCardProps {
  onPress: () => void;
}

export const NewWalletPaymentCard = ({
  onPress,
}: NewWalletPaymentCardProps) => {
  const styles = useStyles();

  return (
    <Box style={styles.card}>
      <IconButton
        icon={(props) => <PlusIcon style={styles.icon} {...props} />}
        onPress={onPress}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ colors, iconSize }) => ({
  icon: {
    color: colors.primary,
    fontSize: iconSize.medium,
  },
  card: {
    ...WALLET_PAYMENT_CARD_STYLE,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
