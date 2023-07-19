import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FiatValue } from '../fiat/FiatValue';
import { ListItem, ListItemProps } from '../list/ListItem';
import { ListItemSkeleton } from '../list/ListItemSkeleton';
import { withSuspense } from '../skeleton/withSuspense';
import { TokenAmount } from './TokenAmount2';
import { BigIntlike } from 'lib';
import { FragmentType, gql, useFragment } from '@api/gen';
import { getTokenValue } from '@token/token';

const FragmentDoc = gql(/* GraphQL */ `
  fragment TokenItem_token on Token {
    id
    address
    name
    decimals
    price {
      id
      current
    }
    ...TokenAmount_token
  }
`);

export interface TokenItemProps extends Partial<ListItemProps> {
  token: FragmentType<typeof FragmentDoc>;
  amount: BigIntlike;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TokenItem = withSuspense(
  ({ token: tokenProp, amount, containerStyle, ...itemProps }: TokenItemProps) => {
    const token = useFragment(FragmentDoc, tokenProp);

    return (
      <ListItem
        leading={token.address}
        headline={token.name}
        supporting={({ Text }) => (
          <View style={styles.supportingContainer}>
            <Text>
              <TokenAmount token={token} amount={amount} />
            </Text>

            {token.price && (
              <Text style={styles.price}>
                {' @ '}
                <FiatValue value={token.price.current} maximumFractionDigits={0} />
              </Text>
            )}
          </View>
        )}
        trailing={({ Text }) =>
          token.price && (
            <Text variant="labelLarge">
              <FiatValue
                value={getTokenValue({
                  amount,
                  price: token.price.current,
                  decimals: token.decimals,
                })}
              />
            </Text>
          )
        }
        containerStyle={containerStyle}
        {...itemProps}
      />
    );
  },
  (props) => <ListItemSkeleton {...props} leading supporting trailing />,
);

const styles = StyleSheet.create({
  price: {
    textAlignVertical: 'center',
  },
  supportingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
