import { FragmentType, gql, useFragment } from '@api/gen';
import { makeStyles } from '@theme/makeStyles';
import { getTokenValue } from '@token/token';
import { Text } from 'react-native-paper';
import { FiatValue } from '~/components/fiat/FiatValue';

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
  const styles = useStyles();
  const { tokens } = useFragment(FragmentDoc, props.tokensQuery);

  const total = tokens.reduce(
    (sum, token) =>
      getTokenValue({
        amount: token.balance,
        price: token.price?.current ?? 0,
        decimals: token.decimals,
      }) + sum,
    0,
  );

  return (
    <Text style={[styles.container, styles.font]}>
      <FiatValue value={total} />
    </Text>
  );
}

const useStyles = makeStyles(({ fonts }) => ({
  container: {
    margin: 16,
  },
  font: fonts.displayMedium,
}));
