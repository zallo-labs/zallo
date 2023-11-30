import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FiatValue } from '../FiatValue';
import { ListItem, ListItemProps } from '../list/ListItem';
import { ListItemSkeleton } from '../list/ListItemSkeleton';
import { withSuspense } from '../skeleton/withSuspense';
import { TokenAmount } from './TokenAmount';
import { tokenToFiat } from 'lib';
import { FragmentType, gql, useFragment } from '@api/generated';
import { TokenIcon } from './TokenIcon';
import { memo } from 'react';
import deepEqual from 'fast-deep-equal';

const Token = gql(/* GraphQL */ `
  fragment TokenItem_Token on Token {
    id
    address
    name
    decimals
    price {
      id
      current
    }
    ...TokenIcon_token
    ...TokenAmount_token
  }
`);

export interface TokenItemProps extends Partial<ListItemProps> {
  token: FragmentType<typeof Token>;
  amount: bigint | string | undefined;
  containerStyle?: StyleProp<ViewStyle>;
}

const TokenItem_ = memo(
  ({ token: tokenProp, amount, containerStyle, ...itemProps }: TokenItemProps) => {
    const token = useFragment(Token, tokenProp);

    return (
      <ListItem
        leading={(props) => <TokenIcon token={token} {...props} />}
        leadingSize="medium"
        headline={token.name}
        supporting={({ Text }) => (
          <View style={styles.supportingContainer}>
            {amount !== undefined && (
              <Text>
                <TokenAmount token={token} amount={amount} />
              </Text>
            )}

            {token.price && (
              <Text style={styles.price}>
                {amount !== undefined && ' @ '}
                <FiatValue value={token.price.current} maximumFractionDigits={0} />
              </Text>
            )}
          </View>
        )}
        trailing={({ Text }) =>
          token.price &&
          amount !== undefined && (
            <Text variant="labelLarge">
              <FiatValue value={tokenToFiat(BigInt(amount), token.price.current, token.decimals)} />
            </Text>
          )
        }
        containerStyle={containerStyle}
        {...itemProps}
      />
    );
  },
  deepEqual,
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

export const TokenItem = withSuspense(TokenItem_, (props) => (
  <ListItemSkeleton {...props} leading supporting trailing />
));
