import { createStyles, useStyles } from '@theme/styles';
import Decimal from 'decimal.js';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { ListHeader } from '#/list/ListHeader';
import { TransactionValue } from '#/transaction/TransactionValue';
import { TokenAmount } from '#/token/TokenAmount';
import { TokenItem } from '#/token/TokenItem';
import { graphql } from 'relay-runtime';
import { TransfersSection_transaction$key } from '~/api/__generated__/TransfersSection_transaction.graphql';
import { useFragment } from 'react-relay';

const Transaction = graphql`
  fragment TransfersSection_transaction on Transaction
  @argumentDefinitions(transaction: { type: "ID!" }) {
    id
    result {
      id
      transfers {
        __typename
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
    simulation {
      id
      transfers {
        __typename
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

export interface TransfersSectionProps {
  transaction: TransfersSection_transaction$key;
  children: ReactNode;
}

export function TransfersSection(props: TransfersSectionProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Transaction, props.transaction);

  const transfers = (p.result ?? p.simulation)?.transfers.filter((t) => !t.isFeeTransfer); // Ignore fee transfers, this is shown by FeeToken

  if (!transfers?.length) return null;

  return (
    <>
      <ListHeader
        trailing={({ Text }) => (
          <Text>
            <TransactionValue transaction={p} />
          </Text>
        )}
      >
        Transfers
      </ListHeader>

      {transfers.map((t) => {
        if (!t.token) return <Text key={t.id}>{`${t.tokenAddress}: ${t.amount}`}</Text>;

        const insufficient = t.token.balance && new Decimal(t.amount).plus(t.token.balance).isNeg();

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
          />
        );
      })}

      {props.children}
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  trailingContainer: {
    alignItems: 'flex-end',
  },
  insufficient: {
    color: colors.error,
  },
}));
