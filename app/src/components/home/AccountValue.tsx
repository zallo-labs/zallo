import { FragmentType, gql, useFragment } from '@api/generated';
import { createStyles } from '@theme/styles';
import { tokenToFiat } from 'lib';
import { Text } from 'react-native-paper';
import { FiatValue } from '~/components/FiatValue';

const FragmentDoc = gql(/* GraphQL */ `
  fragment AccountValue_tokensQuery on Query @argumentDefinitions(account: { type: "Address" }) {
    tokens {
      id
      decimals
      balance(input: { account: $account })
      price {
        id
        current
      }
    }
  }
`);

export interface AccountValueProps {
  tokensQuery: FragmentType<typeof FragmentDoc>;
}

export function AccountValue(props: AccountValueProps) {
  const { tokens } = useFragment(FragmentDoc, props.tokensQuery);

  const total = tokens.reduce(
    (sum, token) => tokenToFiat(token.balance, token.price?.current ?? 0, token.decimals) + sum,
    0,
  );

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
