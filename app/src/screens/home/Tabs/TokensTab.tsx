import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';
import { TokenItem } from '~/components/token/TokenItem2';
import { TabNavigatorScreenProp } from '.';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Address } from 'lib';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { TokensTabQuery, TokensTabQueryVariables } from '@api/gen/graphql';
import { TokensTabDocument } from '@api/generated';
import { getTokenValue } from '@token/token';

gql(/* GraphQL */ `
  query TokensTab($account: Address!) {
    tokens {
      id
      decimals
      price {
        id
        current
      }
      balance(input: { account: $account })
      ...TokenItem_token
    }
  }
`);

export interface TokensTabParams {
  account: Address;
}

export type TokensTabProps = TabNavigatorScreenProp<'Tokens'>;

export const TokensTab = withSuspense(
  ({ route }: TokensTabProps) => {
    const { data } = useSuspenseQuery<TokensTabQuery, TokensTabQueryVariables>(TokensTabDocument, {
      variables: { account: route.params.account },
    });

    const tokens = data.tokens
      .map((t) => ({
        ...t,
        value: getTokenValue({
          amount: t.balance,
          price: t.price?.current ?? 0,
          decimals: t.decimals,
        }),
      }))
      .sort((a, b) => b.value - a.value);

    return (
      <FlashList
        data={tokens}
        renderItem={({ item }) => <TokenItem token={item} amount={item.balance} />}
        ListEmptyComponent={
          <Text variant="titleMedium" style={styles.emptyText}>
            You have no tokens{'\n'}
            Receive tokens to get started
          </Text>
        }
        contentContainerStyle={styles.contentContainer}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        getItemType={(item) => item.__typename}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    );
  },
  (props) => (
    <TabScreenSkeleton {...props} listItems={{ leading: true, supporting: true, trailing: true }} />
  ),
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    margin: 16,
    textAlign: 'center',
  },
});
