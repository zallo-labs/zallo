import { graphql } from 'relay-runtime';
import { FiatValue } from '../FiatValue';
import Decimal from 'decimal.js';
import { useFragment } from 'react-relay';
import { TransactionValue_transaction$key } from '~/api/__generated__/TransactionValue_transaction.graphql';

const Transaction = graphql`
  fragment TransactionValue_transaction on Transaction {
    id
    result {
      id
      transfers {
        id
        value
        isFeeTransfer
      }
    }
  }
`;

export interface TransactionValueProps {
  transaction: TransactionValue_transaction$key;
  hideZero?: boolean;
}

export function TransactionValue(props: TransactionValueProps) {
  const p = useFragment(Transaction, props.transaction);

  const transfers = (p.result?.transfers ?? []).filter((t) => !t.isFeeTransfer);

  const value = Decimal.sum(0, ...transfers.map((t) => t.value ?? 0));

  return <FiatValue value={value} hideZero={props.hideZero} />;
}
