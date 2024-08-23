import { StyleProp, ViewStyle } from 'react-native';
import { FiatValue } from '../FiatValue';
import { ListIconElementProps, ListItem, ListItemProps, ListItemTextProps } from '../list/ListItem';
import { ListItemSkeleton } from '../list/ListItemSkeleton';
import { withSuspense } from '../skeleton/withSuspense';
import { TokenAmount } from './TokenAmount';
import { Decimallike } from 'lib';
import { TokenIcon } from './TokenIcon';
import { FC, memo } from 'react';
import deepEqual from 'fast-deep-equal';
import Decimal from 'decimal.js';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { TokenItem_token$key } from '~/api/__generated__/TokenItem_token.graphql';

const Token = graphql`
  fragment TokenItem_token on Token {
    id
    address
    name
    decimals
    price {
      id
      usd
    }
    ...TokenIcon_token
    ...TokenAmount_token
  }
`;

export interface TokenItemProps extends Omit<Partial<ListItemProps>, 'trailing'> {
  token: TokenItem_token$key;
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
        leading={<TokenIcon token={token} />}
        leadingSize="medium"
        headline={token.name}
        supporting={
          <>
            <TokenAmount token={token} amount={amount} />
            {token.price && (
              <>
                {amount !== undefined && ' | '}
                <FiatValue value={token.price.usd} maximumFractionDigits={0} />
              </>
            )}
          </>
        }
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

export const TokenItem = withSuspense(TokenItem_, (props) => (
  <ListItemSkeleton {...props} leading supporting trailing />
));
