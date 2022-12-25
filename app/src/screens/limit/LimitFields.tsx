import { makeStyles } from '@theme/makeStyles';
import { useToken } from '@token/useToken';
import { TokenLimit, TokenLimitPeriod } from 'lib';
import { StyleProp, ViewStyle } from 'react-native';
import { SegmentedButtons, TextInput } from 'react-native-paper';
import { TextField } from '~/components/fields/TextField';
import { useBigNumberInput } from '~/components/fields/useBigNumberInput';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';

export interface LimitFieldsProps {
  limit: TokenLimit;
  setLimit: (limit: TokenLimit) => void;
  style?: StyleProp<ViewStyle>;
}

export const LimitFields = ({ limit, setLimit, style }: LimitFieldsProps) => {
  const styles = useStyles();
  const token = useToken(limit.token);

  const amountProps = useBigNumberInput({
    decimals: token.decimals,
    value: limit.amount,
    onChange: (amount) => setLimit({ ...limit, amount }),
  });

  return (
    <Container separator={<Box mt={2} />} style={style}>
      <TextField
        {...amountProps}
        label="Amount"
        right={<TextInput.Affix text={token.symbol} />}
        containerStyle={styles.field}
      />

      <SegmentedButtons
        buttons={[
          { label: 'Daily', value: TokenLimitPeriod.Day, showSelectedCheck: true },
          {
            label: 'Weekly',
            value: TokenLimitPeriod.Week,
            showSelectedCheck: true,
          },
          {
            label: 'Monthly',
            value: TokenLimitPeriod.Month,
            showSelectedCheck: true,
          },
        ]}
        value={limit.period}
        onValueChange={(period) => setLimit({ ...limit, period: period as TokenLimitPeriod })}
        style={styles.period}
      />
    </Container>
  );
};

const useStyles = makeStyles(({ space }) => ({
  field: {
    marginHorizontal: space(5),
  },
  period: {
    alignSelf: 'center',
  },
}));
