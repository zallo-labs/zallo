import { SwapVerticalIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { fiatAsBigInt, fiatToToken, tokenToFiat } from '@token/fiat';
import { Token } from '@token/token';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenPriceData } from '@uniswap/useTokenPrice';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { Address } from 'lib';
import { Dispatch, SetStateAction } from 'react';
import { View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { FiatValue } from '~/components/fiat/FiatValue';
import { TokenAmount } from '~/components/token/TokenAmount';
import { logWarning } from '~/util/analytics';

const BUTTON_WIDTH = 64;
const ICON_BUTTON_WIDTH = 40;

export enum InputType {
  Token = 0,
  Fiat = 1,
}

export interface InputsViewProps {
  account: Address;
  token: Token;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  type: InputType;
  setType: Dispatch<SetStateAction<InputType>>;
}

export const InputsView = ({ account, token, input, setInput, type, setType }: InputsViewProps) => {
  const styles = useStyles();
  const balance = useTokenBalance(token, account);
  const price = useTokenPriceData(token).current;

  const inputAmount = (() => {
    const n = parseFloat(input);
    return isNaN(n) ? '0' : n.toString();
  })();

  const tokenAmount =
    type === InputType.Token
      ? parseUnits(inputAmount, token.decimals).toBigInt()
      : fiatToToken(fiatAsBigInt(inputAmount), price, token);

  const fiatValue =
    type === InputType.Token ? tokenToFiat(token, tokenAmount, price) : fiatAsBigInt(inputAmount);

  return (
    <View style={styles.container}>
      <View style={styles.primaryInputContainer}>
        <Button
          mode="text"
          labelStyle={styles.button}
          onPress={() => {
            setType(InputType.Token);
            setInput(formatUnits(balance, token.decimals));
          }}
          onLayout={(e) => {
            if (e.nativeEvent.layout.width !== BUTTON_WIDTH)
              logWarning(`BUTTON_WIDTH mismatch`, { width: e.nativeEvent.layout.width });
          }}
        >
          Max
        </Button>

        <Text
          variant="displayMedium"
          style={styles.primaryInput}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {type === InputType.Token ? input || '0' : `$${input || 0}`}
        </Text>

        <IconButton
          icon={SwapVerticalIcon}
          iconColor={styles.button.color}
          style={styles.iconButton}
          onPress={() => setType((type) => Number(!type))}
          onLayout={(e) => {
            if (e.nativeEvent.layout.width !== ICON_BUTTON_WIDTH)
              logWarning('ICON_BUTTON_WIDTH mismatch', { width: e.nativeEvent.layout.width });
          }}
        />
      </View>

      <Text
        variant="titleLarge"
        style={styles.secondaryInput}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {input.length ? (
          type !== InputType.Token ? (
            <TokenAmount amount={tokenAmount} token={token} />
          ) : (
            <FiatValue value={fiatValue} />
          )
        ) : undefined}
      </Text>

      {tokenAmount > balance && (
        <Text style={styles.balanceWarning}>Greater than available balance</Text>
      )}
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  container: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 32,
  },
  primaryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  button: {
    color: colors.secondary,
  },
  iconButton: {
    marginLeft: BUTTON_WIDTH - ICON_BUTTON_WIDTH,
  },
  primaryInput: {
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
  },
  secondaryInput: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  balanceWarning: {
    marginVertical: 8,
    color: colors.warning,
  },
}));
