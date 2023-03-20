import { Box } from '~/components/layout/Box';
import { FiatValue } from '~/components/fiat/FiatValue';
import { BasicTextField } from '~/components/fields/BasicTextField';
import { useBigIntInput } from '~/components/fields/useBigIntInput';
import { SwapIcon } from '~/util/theme/icons';
import { useTheme } from '@theme/paper';
import { useEffect, useState } from 'react';
import { IconButton, Text } from 'react-native-paper';
import { fiatToToken, FIAT_DECIMALS } from '~/util/token/fiat';
import { useTokenValue } from '@token/useTokenValue';
import { convertTokenAmount, Token } from '@token/token';
import { makeStyles } from '@theme/makeStyles';
import { usePrevious } from '@hook/usePrevious';
import { TokenAmount } from '~/components/token/TokenAmount';
import { useTokenPriceData } from '@uniswap/useTokenPrice';
import { StyleProp, ViewStyle } from 'react-native';

export interface AmountInputProps {
  token: Token;
  amount?: bigint;
  setAmount: (amount?: bigint) => void;
  style?: StyleProp<ViewStyle>;
}

export const AmountInput = ({ token, amount, setAmount, style }: AmountInputProps) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const fiatValue = useTokenValue(token, amount ?? 0n);
  const price = useTokenPriceData(token);

  const [type, setType] = useState<'token' | 'fiat'>('token');
  const [input, setInput] = useState(amount);

  const inputProps = useBigIntInput({
    value: input,
    onChange: setInput,
    decimals: type === 'token' ? token.decimals : FIAT_DECIMALS,
  });

  useEffect(() => {
    // Set amount in a useEffect, rather than onChange in case the token changes
    if (input) {
      const newAmount = type === 'token' ? input : fiatToToken(input, price.current, token);

      if (!amount || newAmount !== amount) setAmount(newAmount);
    }
  }, [amount, input, price, setAmount, token, type]);

  // Convert from token -> token if selected token has been changed
  const previousToken = usePrevious(token);
  useEffect(() => {
    if (previousToken && previousToken !== token && amount) {
      const newAmount = convertTokenAmount(amount, previousToken, token);
      setAmount(newAmount);

      if (type === 'token') setInput(newAmount);
    }
  }, [amount, previousToken, setAmount, token, type]);

  return (
    <Box horizontal justifyContent="space-between" style={style}>
      <Box vertical justifyContent="space-between" style={styles.side}>
        {type === 'token' ? (
          <>
            <Text variant="headlineLarge">$</Text>
            <Box />
          </>
        ) : (
          <>
            <Box />
            <Text variant="displayLarge">$</Text>
          </>
        )}
      </Box>

      <Box vertical justifyContent="space-between">
        <Text variant="headlineLarge" style={{ textAlign: 'center' }}>
          {type === 'token' ? (
            <FiatValue value={fiatValue} symbol={false} />
          ) : (
            <TokenAmount token={token} amount={amount} trailing={false} />
          )}
        </Text>

        <BasicTextField
          {...inputProps}
          textAlign="center"
          style={styles.input}
          placeholderTextColor={colors.secondary}
        />
      </Box>

      <Box vertical justifyContent="center" style={styles.side}>
        <IconButton
          icon={SwapIcon}
          onPress={() => {
            setInput(0n);
            setAmount(0n);
            setType((type) => (type === 'token' ? 'fiat' : 'token'));
          }}
        />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles(({ fonts }) => ({
  input: {
    ...fonts.displayLarge,
  },
  side: {
    width: fonts.headlineLarge.fontSize,
  },
}));
