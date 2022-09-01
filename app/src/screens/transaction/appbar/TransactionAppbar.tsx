import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Box } from '~/components/layout/Box';
import { makeStyles } from '~/util/theme/makeStyles';
import Collapsible from 'react-native-collapsible';
import { Appbar } from 'react-native-paper';
import { CARD_BORDER_RADIUS } from '~/components/card/Card';
import { TransactionWalletSelector } from './TransactionWalletSelector';
import { useTxContext } from '../TransactionProvider';

export interface TransactionAppbarProps {
  scrolled?: boolean;
}

export const TransactionAppbar = ({ scrolled }: TransactionAppbarProps) => {
  const styles = useStyles();
  const { tx, wallet } = useTxContext();

  return (
    <Box style={[styles.container, styles.background]}>
      <Appbar.Header style={styles.background}>
        <AppbarBack iconColor={styles.text.color} />
        <Appbar.Content title="Transaction" titleStyle={styles.text} />
      </Appbar.Header>

      <Collapsible collapsed={!!scrolled}>
        <Box mt={-2} mb={1}>
          <TransactionWalletSelector
            tx={tx}
            executingWallet={wallet}
            textStyle={styles.text}
            iconColor={styles.text.color}
          />
        </Box>
      </Collapsible>
    </Box>
  );
};

const useStyles = makeStyles(({ colors, onBackground }) => ({
  container: {
    borderBottomLeftRadius: CARD_BORDER_RADIUS,
    borderBottomRightRadius: CARD_BORDER_RADIUS,
  },
  background: {
    backgroundColor: colors.tertiaryContainer,
  },
  text: {
    color: onBackground(colors.tertiaryContainer),
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
}));
