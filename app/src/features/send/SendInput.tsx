import { Box } from '@components/Box';
import { FiatValue } from '~/components2/fiat/FiatValue';
import { useBigNumberInput } from '@components/fields/useBigNumberInput';
import { BigNumber } from 'ethers';
import { ZERO } from 'lib';
import { useMemo } from 'react';
import { Button, HelperText, Paragraph } from 'react-native-paper';
import { Token } from '~/token/token';
import { useTokenBalance } from '~/token/useTokenBalance';
import { useTokenValue } from '~/token/useTokenValue';
import { BasicTextField } from '@components/fields/BasicTextField';

export interface SendInputProps {
  token: Token;
  value?: BigNumber;
  onChange: (value: BigNumber) => void;
}

export const SendInput = ({ token, value, onChange }: SendInputProps) => {
  const balance = useTokenBalance(token);
  const { fiatValue } = useTokenValue(token, value ?? ZERO);

  const error = useMemo(
    () => value && balance.lt(value) && 'Insufficient balance',
    [balance, value],
  );

  const inputProps = useBigNumberInput({
    value,
    onChange,
    decimals: token.decimals,
  });

  return (
    <Box vertical alignItems="center">
      <HelperText type="error" style={{ fontSize: 20 }}>
        {error}
      </HelperText>

      <BasicTextField {...inputProps} style={{ fontSize: 50 }} />

      <Box horizontal alignItems="center">
        <Box flex={1} horizontal alignItems="center">
          <Button mode="text" onPress={() => onChange(balance)}>
            Max
          </Button>
        </Box>

        <Paragraph
          style={{ flex: 1, textAlign: 'center', textAlignVertical: 'center' }}
        >
          <FiatValue value={fiatValue} />
        </Paragraph>

        <Box flex={1} />
      </Box>
    </Box>
  );
};
