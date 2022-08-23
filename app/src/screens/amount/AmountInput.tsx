import { Box } from '~/components/layout/Box';
import { FiatValue } from '~/components/fiat/FiatValue';
import { BasicTextField } from '~/components/fields/BasicTextField';
import { useBigNumberInput } from '~/components/fields/useBigNumberInput';
import { TokenValue } from '~/components/token/TokenValue';
import { SwapIcon } from '~/util/theme/icons';
import { useTheme } from '@theme/paper';
import { BigNumber } from 'ethers';
import { ZERO } from 'lib';
import { useCallback, useMemo, useState } from 'react';
import { IconButton, Text } from 'react-native-paper';
import { useSelectedToken } from '~/components/token/useSelectedToken';
import { useTokenPrice } from '~/queries/useTokenPrice.uni';
import { fiatToBigNumber, fiatToToken, FIAT_DECIMALS } from '~/util/token/fiat';
import { useTokenValue } from '@token/useTokenValue';

export interface AmountInputProps {
  amount?: BigNumber;
  setAmount: (amount?: BigNumber) => void;
}

export const AmountInput = ({ amount, setAmount }: AmountInputProps) => {
  const { colors, typescale, iconButton } = useTheme();
  const token = useSelectedToken();
  const { fiatValue } = useTokenValue(token, amount ?? ZERO);
  const {
    price: { current: fiatPrice },
  } = useTokenPrice(token);

  const [type, setType] = useState<'token' | 'fiat'>('token');
  const [value, setValue] = useState(amount);

  const handleValueChange = useCallback(
    (value: BigNumber) => {
      setValue(value);
      setAmount(
        type === 'token' ? value : fiatToToken(value, fiatPrice, token),
      );
    },
    [fiatPrice, setAmount, token, type],
  );

  const input = useBigNumberInput({
    value,
    onChange: handleValueChange,
    decimals: type === 'token' ? token.decimals : FIAT_DECIMALS,
  });

  const switchType = useCallback(() => {
    if (type === 'token') {
      setType('fiat');
      setValue(fiatToBigNumber(fiatValue));
    } else {
      setType('token');
      setValue(amount);
    }
  }, [amount, fiatValue, type]);

  useMemo(() => {
    if (type === 'token' && value !== amount) setValue(amount);
  }, [amount, type, value]);

  return (
    <Box>
      <Box horizontal justifyContent="space-between" alignItems="center">
        <Box width={iconButton.containerSize}>
          {type !== 'fiat' && <Text variant="headlineSmall">$</Text>}
        </Box>

        <Text variant="headlineLarge">
          {type === 'token' ? (
            <FiatValue value={fiatValue} symbol={false} />
          ) : (
            <TokenValue token={token} value={amount ?? ZERO} symbol={false} />
          )}
        </Text>

        <IconButton
          icon={SwapIcon}
          size={iconButton.size}
          onPress={switchType}
          style={{ marginBottom: -50 }}
        />
      </Box>

      <Box horizontal justifyContent="space-between" alignItems="center">
        <Box width={iconButton.containerSize}>
          {type === 'fiat' && <Text variant="displaySmall">$</Text>}
        </Box>

        <BasicTextField
          {...input}
          textAlign="center"
          style={[typescale.displayLarge, { flex: 1 }]}
          placeholderTextColor={colors.secondary}
        />

        <Box width={iconButton.containerSize} />
      </Box>
    </Box>
  );
};
