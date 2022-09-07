import { PlusIcon } from '~/util/theme/icons';
import { WALLET_CARD_STYLE } from './WalletPaymentCardSkeleton';
import { makeStyles } from '@theme/makeStyles';
import { IconButton } from 'react-native-paper';
import { Pressable } from 'react-native';

export interface NewWalletCardProps {
  onPress: () => void;
}

export const NewWalletCard = ({ onPress }: NewWalletCardProps) => {
  const styles = useStyles();

  // Pressable improves swiping by preventing vertical scrolling when touched
  return (
    <Pressable style={styles.card}>
      <IconButton
        icon={(props) => <PlusIcon style={styles.icon} {...props} />}
        onPress={onPress}
      />
    </Pressable>
  );
};

const useStyles = makeStyles(({ colors, iconSize }) => ({
  icon: {
    color: colors.primary,
    fontSize: iconSize.medium,
  },
  card: {
    ...WALLET_CARD_STYLE,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
