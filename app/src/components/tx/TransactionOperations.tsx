import { ItemList } from '#/layout/ItemList';
import { ItemListSubheader } from '#/list/ItemListSubheader';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { TransactionOperations_transaction$key } from '~/api/__generated__/TransactionOperations_transaction.graphql';
import { TransactionOperation } from './TransactionOperation';

const Transaction = graphql`
  fragment TransactionOperations_transaction on Transaction {
    id
    operations {
      ...TransactionOperation_operation
    }
    account {
      id
      address
    }
  }
`;

export interface TransactionOperationsProps {
  transaction: TransactionOperations_transaction$key;
}

export function TransactionOperations(props: TransactionOperationsProps) {
  const t = useFragment(Transaction, props.transaction);

  return (
    <>
      <ItemListSubheader>Operations</ItemListSubheader>
      <ItemList>
        {t.operations.map((op, i) => (
          <TransactionOperation key={i} operation={op} account={t.account.address} />
        ))}
      </ItemList>
    </>
  );
}
