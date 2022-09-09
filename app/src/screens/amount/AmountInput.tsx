import { Box } from '~/components/layout/Box';
import { FiatValue } from '~/components/fiat/FiatValue';
import { BasicTextField } from '~/components/fields/BasicTextField';
import { useBigNumberInput } from '~/components/fields/useBigNumberInput';
import { SwapIcon } from '~/util/theme/icons';
import { useTheme } from '@theme/paper';
import { BigNumber } from 'ethers';
import { ZERO } from 'lib';
import { useEffect, useState } from 'react';
import { IconButton, Text } from 'react-native-paper';
import { fiatToToken, FIAT_DECIMALS } from '~/util/token/fiat';
import { useTokenValue } from '@token/useTokenValue';
import { convertTokenAmount, Token } from '@token/token';
import { makeStyles } from '@theme/makeStyles';
import { usePrevious } from '@hook/usePrevious';
import { TokenAmount } from '~/components/token/TokenAmount';
import { useTokenPrice } from '~/queries/useTokenPrice.uni';

export interface AmountInputProps {
  token: Token;
  amount?: BigNumber;
  setAmount: (amount?: BigNumber) => void;
}

export const AmountInput = ({ token, amount, setAmount }: AmountInputProps) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const fiatValue = useTokenValue(token, amount ?? ZERO);
  const price = useTokenPrice(token);

  const [type, setType] = useState<'token' | 'fiat'>('token');
  const [input, setInput] = useState(amount);

  const inputProps = useBigNumberInput({
    value: input,
    onChange: setInput,
    decimals: type === 'token' ? token.decimals : FIAT_DECIMALS,
  });

  useEffect(() => {
    // Set amount in a useEffect, rather than onChange in case the token changes
    if (input) {
      const newAmount =
        type === 'token' ? input : fiatToToken(input, price.current, token);

      if (!amount || !newAmount.eq(amount)) setAmount(newAmount);
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
    <Box horizontal justifyContent="space-between">
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
            <TokenAmount token={token} amount={amount} symbol={false} />
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
            setInput(ZERO);
            setAmount(ZERO);
            setType((type) => (type === 'token' ? 'fiat' : 'token'));
          }}
        />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles(({ typescale }) => ({
  input: {
    ...typescale.displayLarge,
  },
  side: {
    width: typescale.headlineLarge.fontSize,
  },
}));
