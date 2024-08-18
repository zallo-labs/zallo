import { ItemList } from '#/layout/ItemList';
import { ItemListSubheader } from '#/list/ItemListSubheader';
import { TokenAmount } from '#/token/TokenAmount';
import { TokenItem } from '#/token/TokenItem';
import { TransactionValue } from '#/transaction/TransactionValue';
import { createStyles, useStyles } from '@theme/styles';
import Decimal from 'decimal.js';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { TransactionTransfers_transaction$key } from '~/api/__generated__/TransactionTransfers_transaction.graphql';

const Transaction = graphql`
  fragment TransactionTransfers_transaction on Transaction
  @argumentDefinitions(transaction: { type: "ID!" }) {
    id
    result {
      transfers {
        id
        tokenAddress
        token {
          id
          balance(input: { transaction: $transaction })
          ...TokenItem_token
          ...TokenAmount_token
        }
        amount
        from
        to
        isFeeTransfer
      }
    }
    ...TransactionValue_transaction
  }
`;

export interface TransactionTransfersProps {
  transaction: TransactionTransfers_transaction$key;
}

export function TransactionTransfers(props: TransactionTransfersProps) {
  const { styles } = useStyles(stylesheet);
  const t = useFragment(Transaction, props.transaction);

  const transfers = t.result?.transfers?.filter((t) => !t.isFeeTransfer);

  if (!transfers?.length) return null;

  return (
    <>
      <View style={styles.subheaderContainer}>
        <ItemListSubheader>Transfers</ItemListSubheader>

        <Text variant="bodyMedium">
          <TransactionValue transaction={t} />
        </Text>
      </View>

      <ItemList>
        {transfers.map((t) => {
          if (!t.token) return <Text key={t.id}>{`${t.tokenAddress}: ${t.amount}`}</Text>;

          const insufficient =
            t.token.balance && new Decimal(t.amount).plus(t.token.balance).isNeg();

          return (
            <TokenItem
              key={t.id}
              token={t.token}
              amount={t.amount}
              trailing={({ Trailing }) => (
                <View style={styles.trailingContainer}>
                  <Trailing />

                  {insufficient && t.token?.balance && (
                    <Text variant="bodyMedium" style={styles.insufficient}>
                      <TokenAmount token={t.token} amount={t.token.balance} />
                      {' available'}
                    </Text>
                  )}
                </View>
              )}
              containerStyle={styles.item}
            />
          );
        })}
      </ItemList>
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  subheaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginRight: 24,
  },
  item: {
    backgroundColor: colors.surface,
  },
  trailingContainer: {
    alignItems: 'flex-end',
  },
  insufficient: {
    color: colors.error,
  },
}));
