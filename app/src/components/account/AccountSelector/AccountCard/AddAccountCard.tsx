import { PlusIcon } from '~/util/theme/icons';
import { ACCOUNT_CARD_STYLE } from './AccountCardSkeleton';
import { makeStyles } from '@theme/makeStyles';
import { IconButton } from 'react-native-paper';
import { Pressable } from 'react-native';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export const AddAccountCard = () => {
  const styles = useStyles();
  const { navigate } = useRootNavigation();

  // Pressable improves swiping by preventing vertical scrolling when touched
  return (
    <Pressable style={styles.card}>
      <IconButton
        icon={(props) => <PlusIcon style={styles.icon} {...props} />}
        onPress={() =>
          navigate('CreateAccount', {
            onCreate: () => navigate('Home'),
          })
        }
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
    ...ACCOUNT_CARD_STYLE,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
