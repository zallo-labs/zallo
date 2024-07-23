import { SelectableAddress } from '#/address/SelectableAddress';
import { FiatValue } from '#/FiatValue';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListItem } from '#/list/ListItem';
import { TokenAmount } from '#/token/TokenAmount';
import Decimal from 'decimal.js';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { SendAccount_account$key } from '~/api/__generated__/SendAccount_account.graphql';
import { SendAccount_token$key } from '~/api/__generated__/SendAccount_token.graphql';

const Account = graphql`
  fragment SendAccount_account on Account {
    address
    name
  }
`;

const Token = graphql`
  fragment SendAccount_token on Token @argumentDefinitions(account: { type: "UAddress!" }) {
    address
    name
    balance(input: { account: $account })
    price {
      usd
    }
    ...TokenAmount_token
  }
`;

export interface SendAccountProps {
  account: SendAccount_account$key;
  token: SendAccount_token$key;
  style?: StyleProp<ViewStyle>;
}

export function SendAccount({ style, ...props }: SendAccountProps) {
  const account = useFragment(Account, props.account);
  const token = useFragment(Token, props.token);

  return (
    <View style={style}>
      <ListItem
        leading={<AddressIcon address={account.address} />}
        overline="Account"
        headline={<SelectableAddress address={account.address} />}
        trailing={({ Text }) => (
          <>
            <Text>
              <TokenAmount token={token} amount={token.balance} />
            </Text>
            {token.price && (
              <Text>
                <FiatValue value={new Decimal(token.balance).mul(token.price.usd)} />
              </Text>
            )}
          </>
        )}
      />
    </View>
  );
}
