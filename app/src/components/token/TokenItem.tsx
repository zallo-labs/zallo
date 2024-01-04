import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FiatValue } from '../FiatValue';
import { ListIconElementProps, ListItem, ListItemProps, ListItemTextProps } from '../list/ListItem';
import { ListItemSkeleton } from '../list/ListItemSkeleton';
import { withSuspense } from '../skeleton/withSuspense';
import { TokenAmount } from './TokenAmount';
import { Decimallike } from 'lib';
import { FragmentType, gql, useFragment } from '@api/generated';
import { TokenIcon } from './TokenIcon';
import { FC, memo } from 'react';
import deepEqual from 'fast-deep-equal';
import Decimal from 'decimal.js';

const Token = gql(/* GraphQL */ `
  fragment TokenItem_Token on Token {
    id
    address
    name
    decimals
    price {
      id
      usd
    }
    ...TokenIcon_Token
    ...TokenAmount_token
  }
`);

export interface TokenItemProps extends Omit<Partial<ListItemProps>, 'trailing'> {
  token: FragmentType<typeof Token>;
  amount: Decimallike | undefined;
  containerStyle?: StyleProp<ViewStyle>;
  trailing?: FC<ListIconElementProps & ListItemTextProps & { Trailing: FC }>;
}

const TokenItem_ = memo(
  ({
    token: tokenProp,
    amount,
    containerStyle,
    trailing: TrailingProp,
    ...itemProps
  }: TokenItemProps) => {
    const token = useFragment(Token, tokenProp);

    const Trailing: FC<ListItemTextProps> = ({ Text }) =>
      token.price &&
      amount !== undefined && (
        <Text variant="labelLarge">
          <FiatValue value={new Decimal(amount).mul(token.price.usd)} />
        </Text>
      );

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
                <FiatValue value={token.price.usd} maximumFractionDigits={0} />
              </Text>
            )}
          </View>
        )}
        trailing={({ Text }) =>
          TrailingProp ? (
            <TrailingProp Text={Text} Trailing={() => <Trailing Text={Text} />} />
          ) : (
            <Trailing Text={Text} />
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
