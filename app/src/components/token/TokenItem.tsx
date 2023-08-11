import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FiatValue } from '../fiat/FiatValue';
import { ListItem, ListItemProps } from '../list/ListItem';
import { ListItemSkeleton } from '../list/ListItemSkeleton';
import { withSuspense } from '../skeleton/withSuspense';
import { TokenAmount } from './TokenAmount';
import { BigIntlike, tokenToFiat } from 'lib';
import { FragmentType, gql, useFragment } from '@api/generated';
import { TokenIcon } from './TokenIcon/TokenIcon';
import { memo } from 'react';
import deepEqual from 'fast-deep-equal';

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
    ...TokenIcon_token
    ...TokenAmount_token
  }
`);

export interface TokenItemProps extends Partial<ListItemProps> {
  token: FragmentType<typeof FragmentDoc>;
  amount: BigIntlike;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TokenItem = withSuspense(
  memo(({ token: tokenProp, amount, containerStyle, ...itemProps }: TokenItemProps) => {
    const token = useFragment(FragmentDoc, tokenProp);

    return (
      <ListItem
        leading={(props) => <TokenIcon token={token} {...props} />}
        leadingSize="medium"
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
              <FiatValue value={tokenToFiat(amount, token.price.current, token.decimals)} />
            </Text>
          )
        }
        containerStyle={containerStyle}
        {...itemProps}
      />
    );
  }, deepEqual),
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
