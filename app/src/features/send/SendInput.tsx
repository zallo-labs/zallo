import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { BigNumberField } from '@components/fields/BigNumberField';
import { BigNumber } from 'ethers';
import { ZERO } from 'lib';
import { useMemo } from 'react';
import { Button, HelperText, Paragraph } from 'react-native-paper';
import { Token } from '~/token/token';
import { useTokenBalance } from '~/token/useTokenBalance';
import { useTokenValue } from '~/token/useTokenValue';

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

  return (
    <Box vertical alignItems="center">
      <HelperText type="error" style={{ fontSize: 20 }}>
        {error}
      </HelperText>

      <BigNumberField
        value={value}
        onChange={onChange}
        decimals={token.decimals}
        style={{ fontSize: 50 }}
      />

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
