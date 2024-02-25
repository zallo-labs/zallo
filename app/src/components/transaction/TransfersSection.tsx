import { FragmentType, gql, useFragment } from '@api';
import { createStyles, useStyles } from '@theme/styles';
import Decimal from 'decimal.js';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { ListHeader } from '#/list/ListHeader';
import { ProposalValue } from '#/transaction/ProposalValue';
import { TokenAmount } from '#/token/TokenAmount';
import { TokenItem } from '#/token/TokenItem';

const Transaction = gql(/* GraphQL */ `
  fragment TransfersSection_Transaction on Transaction
  @argumentDefinitions(account: { type: "UAddress!" }, includeAccount: { type: "Boolean!" }) {
    id
    result {
      id
      transfers {
        __typename
        id
        tokenAddress
        token {
          ...TokenItem_Token
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
          balance(input: { account: $account }) @include(if: $includeAccount)
          ...TokenItem_Token
          ...TokenAmount_token
        }
        amount
        from
        to
        isFeeTransfer
      }
    }
    ...ProposalValue_Transaction
  }
`);

export interface TransfersSectionProps {
  proposal: FragmentType<typeof Transaction>;
  children: ReactNode;
}

export function TransfersSection(props: TransfersSectionProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Transaction, props.proposal);

  const transfers = [...(p.result?.transfers ?? p.simulation?.transfers ?? [])].filter(
    (t) => !t.isFeeTransfer,
  ); // Ignore fee transfers, this is shown by FeeToken

  if (!transfers.length) return null;

  return (
    <>
      <ListHeader
        trailing={({ Text }) => (
          <Text>
            <ProposalValue proposal={p} />
          </Text>
        )}
      >
        Transfers
      </ListHeader>

      {transfers.map((t) => {
        if (!t.token) return <Text key={t.id}>{`${t.tokenAddress}: ${t.amount}`}</Text>;

        const insufficient =
          t.__typename === 'SimulatedTransfer' &&
          t.token.balance &&
          new Decimal(t.amount).plus(t.token.balance).isNeg();

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
