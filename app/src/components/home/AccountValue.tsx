import { createStyles } from '@theme/styles';
import Decimal from 'decimal.js';
import { Text } from 'react-native-paper';
import { FiatValue } from '#/FiatValue';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { AccountValue_token$key } from '~/api/__generated__/AccountValue_token.graphql';

const Token = graphql`
  fragment AccountValue_token on Token
  @relay(plural: true)
  @argumentDefinitions(account: { type: "UAddress!" }) {
    balance(input: { account: $account })
    price {
      id
      usd
    }
  }
`;

export interface AccountValueProps {
  tokens: AccountValue_token$key;
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
