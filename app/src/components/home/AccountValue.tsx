import { FragmentType, gql, useFragment } from '@api/generated';
import { createStyles } from '@theme/styles';
import Decimal from 'decimal.js';
import { Text } from 'react-native-paper';
import { FiatValue } from '#/FiatValue';

const Token = gql(/* GraphQL */ `
  fragment AccountValue_Token on Token @argumentDefinitions(account: { type: "UAddress!" }) {
    balance(input: { account: $account })
    price {
      id
      usd
    }
  }
`);

export interface AccountValueProps {
  tokens: FragmentType<typeof Token>[];
}

export function AccountValue(props: AccountValueProps) {
  const tokens = useFragment(Token, props.tokens);

  const total = Decimal.sum(0, ...tokens.map((t) => new Decimal(t.balance).mul(t.price?.usd ?? 0)));

  return (
    <Text variant="displaySmall" style={styles.text}>
      <FiatValue value={total} />
    </Text>
  );
}

const styles = createStyles({
  text: {
    margin: 16,
    marginTop: 24,
  },
});
