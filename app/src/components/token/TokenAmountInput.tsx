import { DecimalInput } from '#/fields/DecimalInput';
import { createStyles, useStyles } from '@theme/styles';
import Decimal from 'decimal.js';
import { Dispatch, SetStateAction } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { TokenAmountInput_token$key } from '~/api/__generated__/TokenAmountInput_token.graphql';
import { TokenIcon } from './TokenIcon';
import { ICON_SIZE } from '@theme/paper';
import { useSelectToken } from '~/hooks/useSelectToken';
import { PressableOpacity } from '#/PressableOpacity';
import { UAddress } from 'lib';

const Token = graphql`
  fragment TokenAmountInput_token on Token {
    id
    symbol
    price {
      usd
    }
    ...TokenIcon_token
  }
`;

export interface TokenAmountInputProps {
  account: UAddress;
  token: TokenAmountInput_token$key;
  amount: Decimal;
  onChange: Dispatch<SetStateAction<Decimal>>;
}

export function TokenAmountInput({ account, amount, onChange, ...props }: TokenAmountInputProps) {
  const { styles } = useStyles(stylesheet);
  const token = useFragment(Token, props.token);
  const selectToken = useSelectToken();

  const value = token.price && amount.mul(token.price.usd);

  return (
    <>
      {value && (
        <PressableOpacity
          style={styles.secondary}
          onPress={() => {
            alert('secondary');
          }}
        >
          <Text variant="headlineMedium" style={styles.approximation}>
            {`≈ $${value.toString()}`}
          </Text>
        </PressableOpacity>
      )}

      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <DecimalInput
            value={amount}
            onChange={onChange}
            style={styles.input}
            placeholder="0"
            placeholderTextColor={styles.placeholder.color}
            selectionColor={styles.selection.color}
            autoFocus
          />
        </View>

        <PressableOpacity
          style={styles.tokenContainer}
          onPress={() => {
            selectToken({ account });
          }}
        >
          <TokenIcon token={token} size={ICON_SIZE.medium} />

          <Text variant="headlineLarge" style={styles.unit}>
            {token.symbol}
          </Text>
        </PressableOpacity>
      </View>
    </>
  );
}

const stylesheet = createStyles(({ colors, fonts, corner }, { screen }) => ({
  secondary: {
    alignSelf: 'flex-start',
    padding: 4,
    borderRadius: corner.s,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  approximation: {
    color: colors.onSurfaceVariant,
  },
  inputContainer: {
    flexBasis: '70%',
  },
  input: {
    ...fonts.displayLarge,
  },
  placeholder: {
    color: colors.tertiary,
  },
  selection: {
    color: colors.tertiary,
  },
  tokenContainer: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: corner.m,
  },
  unit: {
    color: colors.onSurfaceVariant,
  },
}));
