import { SwapVerticalIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { fiatAsBigInt, fiatToToken, tokenToFiat } from '@token/fiat';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenPriceData } from '@uniswap/useTokenPrice';
import assert from 'assert';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { Dispatch, SetStateAction } from 'react';
import { View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { useSelectedAccount } from '~/components/AccountSelector/useSelectedAccount';
import { FiatValue } from '~/components/fiat/FiatValue';
import { TokenAmount } from '~/components/token/TokenAmount';
import { useSelectedToken } from '~/components/token/useSelectedToken';

const BUTTON_WIDTH = 64;
const ICON_BUTTON_WIDTH = 40;

export enum InputType {
  Token = 0,
  Fiat = 1,
}

export interface InputsViewProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  type: InputType;
  setType: Dispatch<SetStateAction<InputType>>;
}

export const InputsView = ({ input, setInput, type, setType }: InputsViewProps) => {
  const styles = useStyles();
  const account = useSelectedAccount();
  const token = useSelectedToken();
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
            assert(e.nativeEvent.layout.width === BUTTON_WIDTH, `BUTTON_WIDTH mismatch`);
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
          {/* {type === InputType.Token ? (
              <TokenAmount
                amount={tokenAmount}
                token={token}
                trailing={false}
                maximumFractionDigits={token.decimals}
              />
            ) : (
              <FiatValue value={fiatValue} maximumFractionDigits={FIAT_DECIMALS} />
            )} */}
        </Text>

        <IconButton
          icon={SwapVerticalIcon}
          iconColor={styles.button.color}
          style={styles.iconButton}
          onPress={() => setType((type) => Number(!type))}
          onLayout={(e) => {
            assert(e.nativeEvent.layout.width === ICON_BUTTON_WIDTH, `ICON_BUTTON_WIDTH mismatch`);
          }}
        />
      </View>

      <Text
        variant="headlineMedium"
        style={styles.secondaryInput}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {input.length ? (
          type !== InputType.Token ? (
            <TokenAmount amount={tokenAmount} token={token} trailing={false} />
          ) : (
            <FiatValue value={fiatValue} />
          )
        ) : undefined}
      </Text>
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
    textAlign: 'center',
  },
}));
