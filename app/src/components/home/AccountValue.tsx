import Decimal from 'decimal.js';
import { Text } from 'react-native-paper';

import { FiatValue } from '~/components/FiatValue';
import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { createStyles } from '~/util/theme/styles';

const Query = gql(/* GraphQL */ `
  fragment AccountValue_Query on Query @argumentDefinitions(account: { type: "UAddress!" }) {
    tokens {
      id
      balance(input: { account: $account })
      price {
        id
        usd
      }
    }
  }
`);

export interface AccountValueProps {
  query: FragmentType<typeof Query>;
}

export function AccountValue(props: AccountValueProps) {
  const { tokens } = useFragment(Query, props.query);

  const total = Decimal.sum(0, ...tokens.map((t) => new Decimal(t.balance).mul(t.price?.usd ?? 0)));

  return (
    <Text variant="displayMedium" style={styles.text}>
      <FiatValue value={total} />
    </Text>
  );
}

const styles = createStyles({
  text: {
    margin: 16,
  },
});
