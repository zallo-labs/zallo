import { makeStyles } from '@theme/makeStyles';
import { useTotalValue } from '@token/useTotalValue';
import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { FiatValue } from '~/components/fiat/FiatValue';
import { LineSkeleton } from '~/components/skeleton/LineSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';

export interface AccountValueProps {
  account: Address;
}

export const AccountValue = withSuspense(({ account }: AccountValueProps) => {
  const styles = useStyles();

  return (
    <Text style={[styles.container, styles.font]}>
      <FiatValue value={useTotalValue(account)} />
    </Text>
  );
}, Skeleton);

function Skeleton() {
  const styles = useStyles();

  return <LineSkeleton width={140} height={styles.font.lineHeight} style={styles.container} />;
}

const useStyles = makeStyles(({ fonts }) => ({
  container: {
    margin: 16,
  },
  font: fonts.displayMedium,
}));
