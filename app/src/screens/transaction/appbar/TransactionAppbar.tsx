import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Box } from '~/components/layout/Box';
import { makeStyles } from '~/util/theme/makeStyles';
import Collapsible from 'react-native-collapsible';
import { Appbar } from 'react-native-paper';
import { CARD_BORDER_RADIUS } from '~/components/card/Card';
import { Tx } from '~/queries/tx';
import { TransactionWalletSelector } from './TransactionWalletSelector';

export interface TransactionAppbarProps {
  tx: Tx;
  scrolled?: boolean;
}

export const TransactionAppbar = ({ tx, scrolled }: TransactionAppbarProps) => {
  const styles = useStyles();

  return (
    <Box style={[styles.container, styles.background]}>
      <Appbar.Header style={styles.background}>
        <AppbarBack iconColor={styles.text.color} />
        <Appbar.Content title="Transaction" titleStyle={styles.text} />
      </Appbar.Header>

      <Collapsible collapsed={!!scrolled}>
        <TransactionWalletSelector
          tx={tx}
          textStyle={styles.text}
          iconColor={styles.text.color}
        />
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
}));
